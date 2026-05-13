<?php
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

global $wpdb;
$table = $wpdb->prefix . 'lynx_chatbot_embeddings';
$wpdb->query( "DROP TABLE IF EXISTS $table" );
delete_option( 'lynx_chatbot_settings' );
