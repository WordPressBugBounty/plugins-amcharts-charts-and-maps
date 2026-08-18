( function ( blocks, element, blockEditor, components, i18n ) {
	'use strict';

	var el = element.createElement;
	var Fragment = element.Fragment;
	var __ = i18n.__;

	var InspectorControls = blockEditor.InspectorControls;
	var useBlockProps = blockEditor.useBlockProps;

	var PanelBody = components.PanelBody;
	var SelectControl = components.SelectControl;
	var Placeholder = components.Placeholder;

	// Build the list of options from the data localized by PHP.
	var data = window.amchartsBlockData || { charts: [] };
	var options = [ { label: __( 'Select a chart or map…', 'amcharts' ), value: '' } ];
	( data.charts || [] ).forEach( function ( chart ) {
		options.push( { label: chart.label, value: chart.value } );
	} );

	// Helper: readable label for the currently selected chart.
	function currentLabel ( value ) {
		for ( var i = 0; i < options.length; i++ ) {
			if ( options[ i ].value === value ) {
				return options[ i ].label;
			}
		}
		return value;
	}

	blocks.registerBlockType( 'amcharts/chart', {
		apiVersion: 2,
		title: __( 'amCharts: Chart or Map', 'amcharts' ),
		description: __( 'Insert a chart or map created with the amCharts plugin.', 'amcharts' ),
		icon: 'chart-pie',
		category: 'embed',
		keywords: [ __( 'chart', 'amcharts' ), __( 'map', 'amcharts' ), __( 'amcharts', 'amcharts' ), __( 'graph', 'amcharts' ) ],
		attributes: {
			id: {
				type: 'string',
				'default': ''
			}
		},
		supports: {
			html: false
		},

		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps ? useBlockProps() : {};

			var picker = el( SelectControl, {
				label: __( 'Chart or map', 'amcharts' ),
				value: attributes.id,
				options: options,
				onChange: function ( value ) {
					setAttributes( { id: value } );
				}
			} );

			var inspector = el(
				InspectorControls,
				{},
				el( PanelBody, { title: __( 'Chart settings', 'amcharts' ), initialOpen: true }, picker )
			);

			var body;
			if ( ! attributes.id ) {
				// Nothing selected yet - show a picker inline.
				body = el(
					Placeholder,
					{
						icon: 'chart-pie',
						label: __( 'amCharts: Chart or Map', 'amcharts' ),
						instructions: options.length > 1
							? __( 'Select a chart or map to insert.', 'amcharts' )
							: __( 'No charts or maps found. Create one under "Charts & Maps" first.', 'amcharts' )
					},
					picker
				);
			} else {
				// A chart is selected - show a compact summary.
				body = el(
					Placeholder,
					{
						icon: 'chart-pie',
						label: __( 'amCharts: Chart or Map', 'amcharts' ),
						instructions: currentLabel( attributes.id )
					}
				);
			}

			return el( Fragment, {}, inspector, el( 'div', blockProps, body ) );
		},

		// Dynamic block - rendered server-side via the shortcode.
		save: function () {
			return null;
		}
	} );

} )(
	window.wp.blocks,
	window.wp.element,
	window.wp.blockEditor,
	window.wp.components,
	window.wp.i18n
);
