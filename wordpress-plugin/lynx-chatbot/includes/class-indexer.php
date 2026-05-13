<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Lynx_Chatbot_Indexer {

	public function __construct() {
		add_action( 'save_post', array( $this, 'on_post_save' ), 20, 3 );
		add_action( 'before_delete_post', array( $this, 'on_post_delete' ) );
	}

	public function on_post_save( $post_id, $post, $update ) {
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}

		$settings = Lynx_Chatbot_Plugin::get_settings();
		if ( ! in_array( $post->post_type, (array) $settings['post_types'], true ) ) {
			return;
		}
		if ( 'publish' !== $post->post_status ) {
			$this->delete_post_embeddings( $post_id );
			return;
		}

		$this->index_post( $post_id );
	}

	public function on_post_delete( $post_id ) {
		$this->delete_post_embeddings( $post_id );
	}

	public function index_post( $post_id ) {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return new WP_Error( 'lynx_chatbot_post_missing', 'Post no encontrado.' );
		}

		$settings = Lynx_Chatbot_Plugin::get_settings();
		$client   = new Lynx_Chatbot_Gemini_Client( $settings['api_key'] );

		$raw    = $post->post_title . "\n\n" . wp_strip_all_tags( strip_shortcodes( $post->post_content ) );
		$clean  = $this->normalize( $raw );
		$chunks = $this->chunk_text( $clean, (int) $settings['chunk_size'], (int) $settings['chunk_overlap'] );

		$this->delete_post_embeddings( $post_id );

		global $wpdb;
		$table = $wpdb->prefix . LYNX_CHATBOT_TABLE;
		$now   = current_time( 'mysql' );

		foreach ( $chunks as $i => $chunk ) {
			$vector = $client->embed( $chunk, $settings['embedding_model'] );
			if ( is_wp_error( $vector ) ) {
				return $vector;
			}

			$wpdb->insert(
				$table,
				array(
					'post_id'     => $post_id,
					'chunk_index' => $i,
					'content'     => $chunk,
					'embedding'   => wp_json_encode( $vector ),
					'updated_at'  => $now,
				),
				array( '%d', '%d', '%s', '%s', '%s' )
			);
		}

		return count( $chunks );
	}

	public function delete_post_embeddings( $post_id ) {
		global $wpdb;
		$table = $wpdb->prefix . LYNX_CHATBOT_TABLE;
		$wpdb->delete( $table, array( 'post_id' => $post_id ), array( '%d' ) );
	}

	public function reindex_all() {
		$settings = Lynx_Chatbot_Plugin::get_settings();

		global $wpdb;
		$table = $wpdb->prefix . LYNX_CHATBOT_TABLE;
		$wpdb->query( "TRUNCATE TABLE $table" );

		$posts = get_posts(
			array(
				'post_type'      => (array) $settings['post_types'],
				'post_status'    => 'publish',
				'numberposts'    => -1,
				'fields'         => 'ids',
				'suppress_filters' => true,
			)
		);

		$indexed = 0;
		$errors  = array();
		foreach ( $posts as $pid ) {
			$result = $this->index_post( $pid );
			if ( is_wp_error( $result ) ) {
				$errors[] = sprintf( 'Post %d: %s', $pid, $result->get_error_message() );
				continue;
			}
			$indexed++;
		}

		return array(
			'indexed' => $indexed,
			'total'   => count( $posts ),
			'errors'  => $errors,
		);
	}

	private function normalize( $text ) {
		$text = preg_replace( '/\s+/u', ' ', $text );
		return trim( (string) $text );
	}

	private function chunk_text( $text, $chunk_size, $overlap ) {
		$chunk_size = max( 200, (int) $chunk_size );
		$overlap    = max( 0, min( (int) $overlap, $chunk_size - 50 ) );

		$length = function_exists( 'mb_strlen' ) ? mb_strlen( $text ) : strlen( $text );
		if ( $length <= $chunk_size ) {
			return array( $text );
		}

		$chunks = array();
		$start  = 0;
		while ( $start < $length ) {
			$piece    = function_exists( 'mb_substr' ) ? mb_substr( $text, $start, $chunk_size ) : substr( $text, $start, $chunk_size );
			$chunks[] = trim( $piece );
			if ( $start + $chunk_size >= $length ) {
				break;
			}
			$start += ( $chunk_size - $overlap );
		}

		return array_values( array_filter( $chunks, 'strlen' ) );
	}
}
