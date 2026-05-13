<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Lynx_Chatbot_Gemini_Client {

	const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

	private $api_key;

	public function __construct( $api_key ) {
		$this->api_key = $api_key;
	}

	public function embed( $text, $model = 'text-embedding-004' ) {
		if ( empty( $this->api_key ) ) {
			return new WP_Error( 'lynx_chatbot_no_key', __( 'Falta la API key de Gemini.', 'lynx-chatbot' ) );
		}

		$url  = self::BASE_URL . '/models/' . rawurlencode( $model ) . ':embedContent?key=' . rawurlencode( $this->api_key );
		$body = array(
			'model'   => 'models/' . $model,
			'content' => array(
				'parts' => array( array( 'text' => (string) $text ) ),
			),
		);

		$response = wp_remote_post(
			$url,
			array(
				'timeout' => 30,
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode( $body ),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$json = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( 200 !== (int) $code ) {
			$msg = isset( $json['error']['message'] ) ? $json['error']['message'] : 'HTTP ' . $code;
			return new WP_Error( 'lynx_chatbot_embed_failed', $msg );
		}

		if ( ! isset( $json['embedding']['values'] ) || ! is_array( $json['embedding']['values'] ) ) {
			return new WP_Error( 'lynx_chatbot_embed_malformed', __( 'Respuesta de embedding inesperada.', 'lynx-chatbot' ) );
		}

		return array_map( 'floatval', $json['embedding']['values'] );
	}

	public function chat( $system_prompt, $context_block, $history, $user_message, $model = 'gemini-2.5-flash-lite' ) {
		if ( empty( $this->api_key ) ) {
			return new WP_Error( 'lynx_chatbot_no_key', __( 'Falta la API key de Gemini.', 'lynx-chatbot' ) );
		}

		$url = self::BASE_URL . '/models/' . rawurlencode( $model ) . ':generateContent?key=' . rawurlencode( $this->api_key );

		$contents = array();
		if ( is_array( $history ) ) {
			foreach ( $history as $turn ) {
				if ( empty( $turn['role'] ) || empty( $turn['text'] ) ) {
					continue;
				}
				$role       = ( 'assistant' === $turn['role'] || 'model' === $turn['role'] ) ? 'model' : 'user';
				$contents[] = array(
					'role'  => $role,
					'parts' => array( array( 'text' => (string) $turn['text'] ) ),
				);
			}
		}

		$user_payload = "PREGUNTA DEL USUARIO:\n" . $user_message . "\n\nCONTEXTO (fragmentos del sitio):\n" . $context_block;
		$contents[]   = array(
			'role'  => 'user',
			'parts' => array( array( 'text' => $user_payload ) ),
		);

		$body = array(
			'systemInstruction' => array(
				'parts' => array( array( 'text' => (string) $system_prompt ) ),
			),
			'contents'          => $contents,
			'generationConfig'  => array(
				'temperature'     => 0.2,
				'maxOutputTokens' => 1024,
			),
			'safetySettings'    => array(),
		);

		$response = wp_remote_post(
			$url,
			array(
				'timeout' => 45,
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode( $body ),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$json = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( 200 !== (int) $code ) {
			$msg = isset( $json['error']['message'] ) ? $json['error']['message'] : 'HTTP ' . $code;
			return new WP_Error( 'lynx_chatbot_chat_failed', $msg );
		}

		$text = '';
		if ( isset( $json['candidates'][0]['content']['parts'] ) && is_array( $json['candidates'][0]['content']['parts'] ) ) {
			foreach ( $json['candidates'][0]['content']['parts'] as $part ) {
				if ( isset( $part['text'] ) ) {
					$text .= $part['text'];
				}
			}
		}

		if ( '' === $text ) {
			return new WP_Error( 'lynx_chatbot_chat_empty', __( 'El modelo devolvió una respuesta vacía.', 'lynx-chatbot' ) );
		}

		return $text;
	}
}
