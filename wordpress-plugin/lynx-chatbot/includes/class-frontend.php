<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Lynx_Chatbot_Frontend {

	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_footer', array( $this, 'render_widget' ) );
		add_shortcode( 'lynx_chatbot', array( $this, 'shortcode' ) );
	}

	public function enqueue_assets() {
		$settings = Lynx_Chatbot_Plugin::get_settings();
		if ( empty( $settings['widget_enabled'] ) && ! $this->page_has_shortcode() ) {
			return;
		}

		wp_enqueue_style(
			'lynx-chatbot',
			LYNX_CHATBOT_URL . 'assets/css/chatbot.css',
			array(),
			LYNX_CHATBOT_VERSION
		);

		wp_enqueue_script(
			'lynx-chatbot',
			LYNX_CHATBOT_URL . 'assets/js/chatbot.js',
			array(),
			LYNX_CHATBOT_VERSION,
			true
		);

		wp_localize_script(
			'lynx-chatbot',
			'LynxChatbot',
			array(
				'endpoint' => esc_url_raw( rest_url( 'lynx-chatbot/v1/chat' ) ),
				'nonce'    => wp_create_nonce( 'wp_rest' ),
				'title'    => $settings['widget_title'],
				'welcome'  => $settings['welcome_message'],
				'strings'  => array(
					'send'        => __( 'Enviar', 'lynx-chatbot' ),
					'placeholder' => __( 'Escribe tu pregunta...', 'lynx-chatbot' ),
					'thinking'    => __( 'Pensando...', 'lynx-chatbot' ),
					'error'       => __( 'No se pudo obtener respuesta.', 'lynx-chatbot' ),
					'sources'     => __( 'Fuentes:', 'lynx-chatbot' ),
					'open'        => __( 'Abrir asistente', 'lynx-chatbot' ),
					'close'       => __( 'Cerrar asistente', 'lynx-chatbot' ),
				),
			)
		);
	}

	public function render_widget() {
		$settings = Lynx_Chatbot_Plugin::get_settings();
		if ( empty( $settings['widget_enabled'] ) ) {
			return;
		}
		echo '<div id="lynx-chatbot-root" data-mode="floating"></div>';
	}

	public function shortcode( $atts ) {
		return '<div class="lynx-chatbot-inline" id="lynx-chatbot-root-inline" data-mode="inline"></div>';
	}

	private function page_has_shortcode() {
		if ( ! is_singular() ) {
			return false;
		}
		$post = get_post();
		return $post && has_shortcode( $post->post_content, 'lynx_chatbot' );
	}
}
