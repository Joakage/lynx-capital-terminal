<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Lynx_Chatbot_Retriever {

	public function retrieve( array $query_vector, $top_k = 5 ) {
		global $wpdb;
		$table = $wpdb->prefix . LYNX_CHATBOT_TABLE;

		$rows = $wpdb->get_results( "SELECT id, post_id, chunk_index, content, embedding FROM $table", ARRAY_A );
		if ( ! $rows ) {
			return array();
		}

		$query_norm = $this->norm( $query_vector );
		if ( 0.0 === $query_norm ) {
			return array();
		}

		$scored = array();
		foreach ( $rows as $row ) {
			$vec = json_decode( $row['embedding'], true );
			if ( ! is_array( $vec ) ) {
				continue;
			}
			$score = $this->cosine( $query_vector, $vec, $query_norm );
			$scored[] = array(
				'post_id' => (int) $row['post_id'],
				'content' => $row['content'],
				'score'   => $score,
			);
		}

		usort(
			$scored,
			function ( $a, $b ) {
				if ( $a['score'] === $b['score'] ) {
					return 0;
				}
				return ( $a['score'] < $b['score'] ) ? 1 : -1;
			}
		);

		return array_slice( $scored, 0, max( 1, (int) $top_k ) );
	}

	public function build_context_block( array $hits ) {
		if ( empty( $hits ) ) {
			return '(No hay contenido indexado relevante.)';
		}
		$lines = array();
		foreach ( $hits as $i => $hit ) {
			$title = get_the_title( $hit['post_id'] );
			$url   = get_permalink( $hit['post_id'] );
			$lines[] = sprintf(
				"[Fragmento %d] Título: %s\nURL: %s\nContenido: %s",
				$i + 1,
				$title ? $title : '(sin título)',
				$url ? $url : '',
				$hit['content']
			);
		}
		return implode( "\n\n---\n\n", $lines );
	}

	private function cosine( array $a, array $b, $norm_a = null ) {
		$len = min( count( $a ), count( $b ) );
		if ( 0 === $len ) {
			return 0.0;
		}
		$dot = 0.0;
		$nb  = 0.0;
		for ( $i = 0; $i < $len; $i++ ) {
			$va   = (float) $a[ $i ];
			$vb   = (float) $b[ $i ];
			$dot += $va * $vb;
			$nb  += $vb * $vb;
		}
		$na = ( null === $norm_a ) ? $this->norm( $a ) : (float) $norm_a;
		$denom = $na * sqrt( $nb );
		if ( 0.0 === $denom ) {
			return 0.0;
		}
		return $dot / $denom;
	}

	private function norm( array $v ) {
		$s = 0.0;
		foreach ( $v as $x ) {
			$x  = (float) $x;
			$s += $x * $x;
		}
		return sqrt( $s );
	}
}
