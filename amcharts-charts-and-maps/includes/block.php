<?php
/**
 * Gutenberg block support
 *
 * Registers an "amCharts" block that lets users insert a chart or map as a
 * regular WordPress block, in addition to the existing legacy block / TinyMCE
 * button. The block is dynamic: it simply stores the selected chart's
 * identifier and renders the existing [amcharts] shortcode on output, so all
 * of the resource/JavaScript handling remains in one place.
 */

// Bail out on WordPress versions without the block editor.
if ( ! function_exists( 'register_block_type' ) )
	return;

add_action( 'init', 'amcharts_register_block' );

function amcharts_register_block () {

	// Register the editor script.
	wp_register_script(
		'amcharts-block',
		plugins_url( 'lib/block/amcharts_block.js', AMCHARTS_BASE ),
		array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n' ),
		AMCHARTS_VERSION,
		true
	);

	// Make the list of available charts available to the editor script. This
	// (and the query it needs) is only relevant in the admin/editor, so we skip
	// it on the front end to avoid an unnecessary query on every page load.
	if ( is_admin() ) {
		wp_localize_script( 'amcharts-block', 'amchartsBlockData', array(
			'charts' => amcharts_get_block_chart_list(),
		) );

		// Load translations for the script if available.
		if ( function_exists( 'wp_set_script_translations' ) ) {
			wp_set_script_translations( 'amcharts-block', 'amcharts', AMCHARTS_DIR . 'langs' );
		}
	}

	// Register the (dynamic) block.
	register_block_type( 'amcharts/chart', array(
		'editor_script'   => 'amcharts-block',
		'render_callback' => 'amcharts_block_render',
		'attributes'      => array(
			'id' => array(
				'type'    => 'string',
				'default' => '',
			),
		),
	) );

}

/**
 * Returns a list of available charts for the block picker.
 *
 * Each entry uses the chart slug as the value when one is set, falling back to
 * the post ID - this matches the identifier used by the shortcode and the
 * admin "Shortcode" column.
 */
function amcharts_get_block_chart_list () {
	$charts = array();

	$posts = get_posts( array(
		'post_type'      => 'amchart',
		'posts_per_page' => -1,
		'orderby'        => 'title',
		'order'          => 'ASC',
		'post_status'    => 'publish',
	) );

	foreach ( $posts as $post ) {
		$slug  = get_post_meta( $post->ID, '_amcharts_slug', true );
		$value = '' != $slug ? $slug : (string) $post->ID;
		$title = '' != $post->post_title ? $post->post_title : __( '(no title)', 'amcharts' );

		$charts[] = array(
			'label' => $title . ' [' . $value . ']',
			'value' => $value,
		);
	}

	return $charts;
}

/**
 * Server-side render callback for the block.
 *
 * Delegates to the existing shortcode handler so that resources and JavaScript
 * are enqueued exactly as they are for the classic shortcode.
 */
function amcharts_block_render ( $attributes ) {
	$id = isset( $attributes['id'] ) ? trim( $attributes['id'] ) : '';

	if ( '' === $id )
		return '';

	return amcharts_shortcode( array( 'id' => $id ) );
}
