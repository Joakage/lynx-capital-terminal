<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Lynx_Chatbot_Admin {

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	public function register_menu() {
		add_options_page(
			__( 'Lynx Chatbot', 'lynx-chatbot' ),
			__( 'Lynx Chatbot', 'lynx-chatbot' ),
			'manage_options',
			'lynx-chatbot',
			array( $this, 'render_page' )
		);
	}

	public function register_settings() {
		register_setting(
			'lynx_chatbot_group',
			LYNX_CHATBOT_OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize' ),
				'default'           => Lynx_Chatbot_Plugin::default_settings(),
			)
		);
	}

	public function sanitize( $input ) {
		$defaults = Lynx_Chatbot_Plugin::default_settings();
		$out      = Lynx_Chatbot_Plugin::get_settings();

		$out['api_key']         = isset( $input['api_key'] ) ? sanitize_text_field( $input['api_key'] ) : $out['api_key'];
		$out['chat_model']      = isset( $input['chat_model'] ) ? sanitize_text_field( $input['chat_model'] ) : $defaults['chat_model'];
		$out['embedding_model'] = isset( $input['embedding_model'] ) ? sanitize_text_field( $input['embedding_model'] ) : $defaults['embedding_model'];
		$out['top_k']           = isset( $input['top_k'] ) ? max( 1, min( 15, (int) $input['top_k'] ) ) : $defaults['top_k'];
		$out['chunk_size']      = isset( $input['chunk_size'] ) ? max( 200, min( 4000, (int) $input['chunk_size'] ) ) : $defaults['chunk_size'];
		$out['chunk_overlap']   = isset( $input['chunk_overlap'] ) ? max( 0, min( 1000, (int) $input['chunk_overlap'] ) ) : $defaults['chunk_overlap'];
		$out['system_prompt']   = isset( $input['system_prompt'] ) ? wp_kses_post( $input['system_prompt'] ) : $defaults['system_prompt'];
		$out['welcome_message'] = isset( $input['welcome_message'] ) ? sanitize_text_field( $input['welcome_message'] ) : $defaults['welcome_message'];
		$out['widget_title']    = isset( $input['widget_title'] ) ? sanitize_text_field( $input['widget_title'] ) : $defaults['widget_title'];
		$out['widget_enabled']  = ! empty( $input['widget_enabled'] ) ? 1 : 0;

		$post_types = isset( $input['post_types'] ) && is_array( $input['post_types'] ) ? $input['post_types'] : array();
		$post_types = array_filter( array_map( 'sanitize_key', $post_types ) );
		$out['post_types'] = $post_types ? array_values( $post_types ) : $defaults['post_types'];

		return $out;
	}

	public function enqueue_admin_assets( $hook ) {
		if ( 'settings_page_lynx-chatbot' !== $hook ) {
			return;
		}
		wp_enqueue_script(
			'lynx-chatbot-admin',
			LYNX_CHATBOT_URL . 'assets/js/admin.js',
			array(),
			LYNX_CHATBOT_VERSION,
			true
		);
		wp_localize_script(
			'lynx-chatbot-admin',
			'LynxChatbotAdmin',
			array(
				'reindexUrl' => esc_url_raw( rest_url( 'lynx-chatbot/v1/reindex' ) ),
				'nonce'      => wp_create_nonce( 'wp_rest' ),
				'strings'    => array(
					'running' => __( 'Reindexando...', 'lynx-chatbot' ),
					'done'    => __( 'Hecho:', 'lynx-chatbot' ),
					'error'   => __( 'Error:', 'lynx-chatbot' ),
				),
			)
		);
	}

	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$settings = Lynx_Chatbot_Plugin::get_settings();
		$types    = get_post_types( array( 'public' => true ), 'objects' );
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Lynx Chatbot', 'lynx-chatbot' ); ?></h1>

			<form method="post" action="options.php">
				<?php settings_fields( 'lynx_chatbot_group' ); ?>

				<h2><?php esc_html_e( 'Conexión con Gemini', 'lynx-chatbot' ); ?></h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="lynx_api_key"><?php esc_html_e( 'API Key de Google AI Studio', 'lynx-chatbot' ); ?></label></th>
						<td>
							<input type="password" id="lynx_api_key" name="<?php echo esc_attr( LYNX_CHATBOT_OPTION ); ?>[api_key]" value="<?php echo esc_attr( $settings['api_key'] ); ?>" class="regular-text" autocomplete="off" />
							<p class="description"><?php esc_html_e( 'Crea una API key gratuita en https://aistudio.google.com/apikey y pégala aquí.', 'lynx-chatbot' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="lynx_chat_model"><?php esc_html_e( 'Modelo de chat', 'lynx-chatbot' ); ?></label></th>
						<td>
							<input type="text" id="lynx_chat_model" name="<?php echo esc_attr( LYNX_CHATBOT_OPTION ); ?>[chat_model]" value="<?php echo esc_attr( $settings['chat_model'] ); ?>" class="regular-text" />
							<p class="description"><?php esc_html_e( 'Por defecto: gemini-2.5-flash-lite (rápido y barato). Alternativas: gemini-2.5-flash, gemini-2.5-pro.', 'lynx-chatbot' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="lynx_embedding_model"><?php esc_html_e( 'Modelo de embeddings', 'lynx-chatbot' ); ?></label></th>
						<td>
							<input type="text" id="lynx_embedding_model" name="<?php echo esc_attr( LYNX_CHATBOT_OPTION ); ?>[embedding_model]" value="<?php echo esc_attr( $settings['embedding_model'] ); ?>" class="regular-text" />
							<p class="description"><?php esc_html_e( 'Por defecto: text-embedding-004.', 'lynx-chatbot' ); ?></p>
						</td>
					</tr>
				</table>

				<h2><?php esc_html_e( 'Comportamiento del asistente', 'lynx-chatbot' ); ?></h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="lynx_system_prompt"><?php esc_html_e( 'System prompt', 'lynx-chatbot' ); ?></label></th>
						<td>
							<textarea id="lynx_system_prompt" name="<?php echo esc_attr( LYNX_CHATBOT_OPTION ); ?>[system_prompt]" rows="8" class="large-text code"><?php echo esc_textarea( $settings['system_prompt'] ); ?></textarea>
							<p class="description"><?php esc_html_e( 'Instrucción del sistema. Mantén la restricción de responder solo con el contexto, para que rechace preguntas fuera de tema.', 'lynx-chatbot' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="lynx_welcome"><?php esc_html_e( 'Mensaje de bienvenida', 'lynx-chatbot' ); ?></label></th>
						<td>
							<input type="text" id="lynx_welcome" name="<?php echo esc_attr( LYNX_CHATBOT_OPTION ); ?>[welcome_message]" value="<?php echo esc_attr( $settings['welcome_message'] ); ?>" class="large-text" />
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="lynx_top_k"><?php esc_html_e( 'Fragmentos a recuperar (top_k)', 'lynx-chatbot' ); ?></label></th>
						<td>
							<input type="number" min="1" max="15" id="lynx_top_k" name="<?php echo esc_attr( LYNX_CHATBOT_OPTION ); ?>[top_k]" value="<?php echo esc_attr( $settings['top_k'] ); ?>" />
						</td>
					</tr>
				</table>

				<h2><?php esc_html_e( 'Indexación', 'lynx-chatbot' ); ?></h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><?php esc_html_e( 'Tipos de contenido a indexar', 'lynx-chatbot' ); ?></th>
						<td>
							<?php foreach ( $types as $type ) :
								$checked = in_array( $type->name, (array) $settings['post_types'], true ); ?>
								<label style="margin-right:12px;">
									<input type="checkbox" name="<?php echo esc_attr( LYNX_CHATBOT_OPTION ); ?>[post_types][]" value="<?php echo esc_attr( $type->name ); ?>" <?php checked( $checked ); ?> />
									<?php echo esc_html( $type->labels->singular_name . ' (' . $type->name . ')' ); ?>
								</label>
							<?php endforeach; ?>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="lynx_chunk_size"><?php esc_html_e( 'Tamaño de fragmento (caracteres)', 'lynx-chatbot' ); ?></label></th>
						<td><input type="number" min="200" max="4000" id="lynx_chunk_size" name="<?php echo esc_attr( LYNX_CHATBOT_OPTION ); ?>[chunk_size]" value="<?php echo esc_attr( $settings['chunk_size'] ); ?>" /></td>
					</tr>
					<tr>
						<th scope="row"><label for="lynx_chunk_overlap"><?php esc_html_e( 'Solapamiento entre fragmentos', 'lynx-chatbot' ); ?></label></th>
						<td><input type="number" min="0" max="1000" id="lynx_chunk_overlap" name="<?php echo esc_attr( LYNX_CHATBOT_OPTION ); ?>[chunk_overlap]" value="<?php echo esc_attr( $settings['chunk_overlap'] ); ?>" /></td>
					</tr>
				</table>

				<h2><?php esc_html_e( 'Widget del frontend', 'lynx-chatbot' ); ?></h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><?php esc_html_e( 'Mostrar widget', 'lynx-chatbot' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="<?php echo esc_attr( LYNX_CHATBOT_OPTION ); ?>[widget_enabled]" value="1" <?php checked( ! empty( $settings['widget_enabled'] ) ); ?> />
								<?php esc_html_e( 'Mostrar el botón flotante del chatbot en el sitio público', 'lynx-chatbot' ); ?>
							</label>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="lynx_widget_title"><?php esc_html_e( 'Título del widget', 'lynx-chatbot' ); ?></label></th>
						<td><input type="text" id="lynx_widget_title" name="<?php echo esc_attr( LYNX_CHATBOT_OPTION ); ?>[widget_title]" value="<?php echo esc_attr( $settings['widget_title'] ); ?>" class="regular-text" /></td>
					</tr>
				</table>

				<?php submit_button(); ?>
			</form>

			<hr />

			<h2><?php esc_html_e( 'Reconstruir el índice', 'lynx-chatbot' ); ?></h2>
			<p><?php esc_html_e( 'Genera embeddings para todos los posts/páginas publicados del tipo seleccionado. Úsalo la primera vez o cuando cambies de modelo de embeddings.', 'lynx-chatbot' ); ?></p>
			<p>
				<button type="button" class="button button-primary" id="lynx-reindex-btn"><?php esc_html_e( 'Reindexar ahora', 'lynx-chatbot' ); ?></button>
				<span id="lynx-reindex-status" style="margin-left:12px;"></span>
			</p>
		</div>
		<?php
	}
}
