import React, { Component } from 'react';
import './_RadioButtonsSelectInput.css';

/**
 * RadioButtonsSelectInput
 *
 * This component is a set of radio buttons to let the user select only one option among a group of options.
 * The component supports any number of options (at least 1), but it will render as a row for any screen width (elements doesn't stack), so I recommend not to put more than 6 elements.
 *
 * @param outerClassName: class of the outermost <div> element
 * @param outerId: id of the outermost <div> element
 * @param name: Name of the radio input set.
 *              IMPORTANT: this property has to be UNIQUE. If there's more than one RadioButtonsSelectInputs on the page, give them different names.
 * @param buttonsContent: this is an array that contains the content of the buttons.
 *                        Attributes than be given to a button are: text, images, labelClass
 *                        Additionally, each radio input needs to have a UNIQUE "value" attribute that will be used along with the "name" parameter to create a unique ID.
 *                        Example (two buttons): buttonsContent = [ {value: "20", text: "twenty", images:["/path/to/image"]}, {value: "50", text: "fifty"} ]
 * @param selectedButtonValue: This is a parameter to set the button that will be selected by default when the component renders (this is optional).
 * @param onChange: Event handler for onChange events on any radio input
 */
class RadioButtonsSelectInput extends React.Component {

	constructor(props) {
		super(props);

		// state variables
		this.state = {
			selectedInputValue: props.selectedButtonValue || "",
			isComponentFocused: false	// stores a boolean that tells whether the whole component is focused or not (that is, one input inside the component is focused)
		}

		// function bindings
		this.isElementChecked = this.isElementChecked.bind(this);
		this.onRadioInputChange = this.onRadioInputChange.bind(this);
		this.onRadioInputFocus = this.onRadioInputFocus.bind(this);
		this.onRadioInputBlur = this.onRadioInputBlur.bind(this);

		// compute each button width using the amount of buttons (all buttons should have the same width)
		this.buttonWidth = "";
		if(this.props.buttonsContent && this.props.buttonsContent.length) {
			this.buttonWidth = (100/this.props.buttonsContent.length) + "%";
		}
	}

	render() {
		return (
			<div className={"radioButtonsSelectInput" + (this.props.outerClassName ? (" " + this.props.outerClassName) : "") + (this.state.isComponentFocused ? " _focused" : "")}>

				{this.props.buttonsContent.map( (element, index) =>

					<label className={"radioButtonsSelectInput--label" + (this.isElementChecked(element.value) ? ' _selected' : '') + (element.labelClass ? ' ' + element.labelClass : '')}
						   style={ {width: this.buttonWidth} }
						   htmlFor={this.props.name + '-' + element.value}
						   key={this.props.name + '-' + element.value}>

						<input type="radio"
							   name={this.props.name}
							   id={this.props.name + '-' + element.value}
							   className="radioButtonsSelectInput--radioInput visually-hidden"
							   value={element.value}
							   onChange={this.onRadioInputChange}
							   onFocus={this.onRadioInputFocus}
							   onBlur={this.onRadioInputBlur}
							   checked={this.isElementChecked(element.value)}/>

						<span className="radioButtonsSelectInput--buttonText">{element.text}</span>

						{element.images && element.images.length > 0 &&
							<div className="radioButtonsSelectInput--buttonImagesWrapper">
								{element.images.map( (imgsrc, index) =>
									<img key={index} className="radioButtonsSelectInput--buttonImage"
										 style={ {width: (100/element.images.length) + "%"} }
									 	 src={imgsrc}/>
								)}
							</div>
						}

					</label>

				)}

			</div>
		);
	}

	isElementChecked(elementValue) {
		return this.props.selectedButtonValue ? this.props.selectedButtonValue === elementValue : this.state.selectedInputValue;
	}

	onRadioInputChange(event) {

		this.setState({ selectedInputValue: event.target.value });

		if( (typeof this.props.onChange) === 'function' ) {
			this.props.onChange(event);
		}
	}

	onRadioInputFocus(event) {
		this.setState({isComponentFocused:true})
	}

	onRadioInputBlur(event) {
		this.setState({isComponentFocused:false})
	}

}

export default RadioButtonsSelectInput;
