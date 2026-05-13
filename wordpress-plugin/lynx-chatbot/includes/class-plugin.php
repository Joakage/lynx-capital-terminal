<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Lynx_Chatbot_Plugin {

	public static function boot() {
		new Lynx_Chatbot_Admin();
		new Lynx_Chatbot_Rest_Api();
		new Lynx_Chatbot_Frontend();
		new Lynx_Chatbot_Indexer();
	}

	public static function activate() {
		global $wpdb;
		$table   = $wpdb->prefix . LYNX_CHATBOT_TABLE;
		$charset = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE $table (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			post_id BIGINT UNSIGNED NOT NULL,
			chunk_index INT UNSIGNED NOT NULL,
			content LONGTEXT NOT NULL,
			embedding LONGTEXT NOT NULL,
			updated_at DATETIME NOT NULL,
			PRIMARY KEY (id),
			KEY post_id (post_id)
		) $charset;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		if ( false === get_option( LYNX_CHATBOT_OPTION ) ) {
			add_option( LYNX_CHATBOT_OPTION, self::default_settings() );
		}
	}

	public static function deactivate() {
		// Intencionalmente vacío: no borramos datos al desactivar.
	}

	public static function default_settings() {
		return array(
			'api_key'         => '',
			'chat_model'      => 'gemini-2.5-flash-lite',
			'embedding_model' => 'text-embedding-004',
			'top_k'           => 5,
			'chunk_size'      => 1200,
			'chunk_overlap'   => 150,
			'post_types'      => array( 'post', 'page' ),
			'system_prompt'   => "Eres el asistente del sitio Lynx Capital. Responde ÚNICAMENTE con información presente en el CONTEXTO proporcionado más abajo. Si la respuesta no está claramente en el contexto, responde exactamente: \"No tengo esa información en el contenido del sitio.\" No inventes datos, no uses conocimiento externo, no especules. Responde en castellano, de forma clara y concisa. Cita el título del post o página de donde sacas la información cuando sea útil.",
			'welcome_message' => '¡Hola! Soy el asistente de Lynx Capital. Puedo responder preguntas sobre el contenido publicado en la web.',
			'widget_enabled'  => 1,
			'widget_title'    => 'Asistente Lynx',
		);
	}

	public static function get_settings() {
		$saved = get_option( LYNX_CHATBOT_OPTION, array() );
		return wp_parse_args( is_array( $saved ) ? $saved : array(), self::default_settings() );
	}
}
