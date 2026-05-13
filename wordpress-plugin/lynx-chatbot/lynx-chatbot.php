<?php
/**
 * Plugin Name: Lynx Chatbot
 * Plugin URI:  https://lynxcapital.example
 * Description: Chatbot RAG sobre el contenido del sitio usando Gemini (Google AI Studio). Responde solo con información de tus posts y páginas.
 * Version:     0.1.0
 * Author:      Lynx Capital
 * License:     GPL-2.0+
 * Text Domain: lynx-chatbot
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'LYNX_CHATBOT_VERSION', '0.1.0' );
define( 'LYNX_CHATBOT_FILE', __FILE__ );
define( 'LYNX_CHATBOT_PATH', plugin_dir_path( __FILE__ ) );
define( 'LYNX_CHATBOT_URL', plugin_dir_url( __FILE__ ) );
define( 'LYNX_CHATBOT_OPTION', 'lynx_chatbot_settings' );
define( 'LYNX_CHATBOT_TABLE', 'lynx_chatbot_embeddings' );

require_once LYNX_CHATBOT_PATH . 'includes/class-gemini-client.php';
require_once LYNX_CHATBOT_PATH . 'includes/class-indexer.php';
require_once LYNX_CHATBOT_PATH . 'includes/class-retriever.php';
require_once LYNX_CHATBOT_PATH . 'includes/class-rest-api.php';
require_once LYNX_CHATBOT_PATH . 'includes/class-admin.php';
require_once LYNX_CHATBOT_PATH . 'includes/class-frontend.php';
require_once LYNX_CHATBOT_PATH . 'includes/class-plugin.php';

register_activation_hook( __FILE__, array( 'Lynx_Chatbot_Plugin', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Lynx_Chatbot_Plugin', 'deactivate' ) );

add_action( 'plugins_loaded', array( 'Lynx_Chatbot_Plugin', 'boot' ) );
