<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Lynx_Chatbot_Rest_Api {

	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			'lynx-chatbot/v1',
			'/chat',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'handle_chat' ),
				'permission_callback' => array( $this, 'check_nonce' ),
				'args'                => array(
					'message' => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'history' => array(
						'required' => false,
						'type'     => 'array',
					),
				),
			)
		);

		register_rest_route(
			'lynx-chatbot/v1',
			'/reindex',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'handle_reindex' ),
				'permission_callback' => array( $this, 'check_admin' ),
			)
		);
	}

	public function check_nonce( WP_REST_Request $request ) {
		$nonce = $request->get_header( 'x_wp_nonce' );
		if ( ! $nonce ) {
			$nonce = $request->get_param( '_wpnonce' );
		}
		return (bool) wp_verify_nonce( $nonce, 'wp_rest' );
	}

	public function check_admin() {
		return current_user_can( 'manage_options' );
	}

	public function handle_chat( WP_REST_Request $request ) {
		$settings = Lynx_Chatbot_Plugin::get_settings();

		if ( empty( $settings['api_key'] ) ) {
			return new WP_REST_Response(
				array( 'error' => __( 'El asistente no está configurado todavía.', 'lynx-chatbot' ) ),
				503
			);
		}

		$message = trim( (string) $request->get_param( 'message' ) );
		if ( '' === $message ) {
			return new WP_REST_Response( array( 'error' => __( 'Mensaje vacío.', 'lynx-chatbot' ) ), 400 );
		}
		if ( strlen( $message ) > 2000 ) {
			$message = substr( $message, 0, 2000 );
		}

		$history_raw = $request->get_param( 'history' );
		$history     = array();
		if ( is_array( $history_raw ) ) {
			$history_raw = array_slice( $history_raw, -10 );
			foreach ( $history_raw as $turn ) {
				if ( ! is_array( $turn ) || empty( $turn['role'] ) || empty( $turn['text'] ) ) {
					continue;
				}
				$history[] = array(
					'role' => sanitize_text_field( $turn['role'] ),
					'text' => wp_strip_all_tags( (string) $turn['text'] ),
				);
			}
		}

		$client = new Lynx_Chatbot_Gemini_Client( $settings['api_key'] );

		$query_vec = $client->embed( $message, $settings['embedding_model'] );
		if ( is_wp_error( $query_vec ) ) {
			return new WP_REST_Response( array( 'error' => $query_vec->get_error_message() ), 502 );
		}

		$retriever = new Lynx_Chatbot_Retriever();
		$hits      = $retriever->retrieve( $query_vec, (int) $settings['top_k'] );
		$context   = $retriever->build_context_block( $hits );

		$answer = $client->chat(
			$settings['system_prompt'],
			$context,
			$history,
			$message,
			$settings['chat_model']
		);

		if ( is_wp_error( $answer ) ) {
			return new WP_REST_Response( array( 'error' => $answer->get_error_message() ), 502 );
		}

		$sources = array();
		foreach ( $hits as $hit ) {
			$post_id = $hit['post_id'];
			$sources[ $post_id ] = array(
				'post_id' => $post_id,
				'title'   => get_the_title( $post_id ),
				'url'     => get_permalink( $post_id ),
				'score'   => round( (float) $hit['score'], 4 ),
			);
		}

		return new WP_REST_Response(
			array(
				'answer'  => $answer,
				'sources' => array_values( $sources ),
			),
			200
		);
	}

	public function handle_reindex( WP_REST_Request $request ) {
		$indexer = new Lynx_Chatbot_Indexer();
		$result  = $indexer->reindex_all();
		return new WP_REST_Response( $result, 200 );
	}
}
