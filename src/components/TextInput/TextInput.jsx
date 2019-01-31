import React, { Component } from 'react';
import ErrorMessage from '../ErrorMessage/ErrorMessage.jsx';
import './_TextInput.css';

/**
 * TextInput
 *
 * This component is a text input that includes a label, validation handling and error messages
 * @param className: class of the component
 * @param id: id of the input element
 * @param labelText: text to be displayed on the label. The label text WON'T be displayed if the animatedPlaceholder is set (it's redundant to have both).
 * @param animatedPlaceholder: This is NOT the default HTML placeholder.
 *                             It is a <label> element that acts as a placeholder and moves using a smooth transition when we type something on the input.
 * @param showRequiredMark: If true, the label of the input will have a mark next to it, indicating it's required. NOT USED FOR VALIDATION, only for displaying the mark.
 * @param showRequiredText: If true, the label of the input will have some text next to it, indicating it's required. NOT USED FOR VALIDATION.
 * @param showOptionalText: If true, the label of the input will have some text next to it, indicating it's optional. NOT USED FOR VALIDATION.
 * @param onChange: Event handler for change events on the input
 * @param onBlur: Event handler for blur events on the input
 * @param onValid: Event handler to be triggered when the input passes the validation.
 * @param onError: Event handler to be triggered when any errors are found on the input. It will pass the error indexes as an array.
 * @param isActive: This is used when for example the input is empty and the state is changed. Then the placeholder becomes smaller.
 * @param isDirty: If set to true, the error messages will show up (if any). If set to false, they won't show up.
 *                 The TextInput already checks whether the input is dirty or not, but this parameter can be used to force the error message to show/hide.
 * @param errors: This is an array of errors as strings. If this property is set, the component will NOT DO ANY VALIDATIONS and will just display the errors.
 *                This should be used for displaying errors after a use case different from the user typing in the input (for example, after a form submit).
 *                IMPORTATNT: if this property is set, the "validationsAndErrors" property will be IGNORED.
 * @param validationsAndErrors: This is an array that contains objects with the following structure: {"validation": someValidationFunction, "error": "some error message"}
 *                              The value of "error" will be displayed if the current input value is not validated by the function inside "validation".
 *                              If this parameter is not set, errors will never be shown
 * ADDITIONAL NOTE 1: this component supports any additional <input> properties to be set by the user, such as autoComplete or name. The additional properties will be set in the input element.
 *
 * ADDITIONAL NOTE 2: If, for some reason, the parent modifies the value of the input during onChange, then the parent's onChange handler has to return the input's value!! (see CreditCardForm component).
 */
class TextInput extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			inputIsDirty: false,
            inputIsFocused: false,
			inputValue: '',
			errors: []
		}

        // ref to the HTML input.
        // This is used to get/set the cursor position on the input for very special cases (only used in CreditCardForm as of May 2017)
        this.input = null;

		this.getValidClassName = this.getValidClassName.bind(this);
		this.getAnimatedPlaceholderClassName = this.getAnimatedPlaceholderClassName.bind(this);
        this.getLabelSuffix = this.getLabelSuffix.bind(this);
		this.onInputChange = this.onInputChange.bind(this);
        this.onInputFocus = this.onInputFocus.bind(this);
		this.onInputBlur = this.onInputBlur.bind(this);
	}

	render() {

		// ...otherProperties contains any other properties declared by the user except for the ones specified here
		const { className, id, labelText, placeholder, animatedPlaceholder, showRequiredMark, showRequiredText, showOptionalText, disabled, onChange, onFocus, onBlur, onValid, onError, isActive, isDirty, errors, validationsAndErrors, ...otherProperties } = this.props;

		return (
			<div className={className ? ("textInput " + className) : "textInput"}>

				{labelText && !animatedPlaceholder &&	// if the input has an animated placeholder, there's no need for a label
														// So if both parameters are set, only the animated placeholder will be shown
					<label className="textInput--label" htmlFor={id}>
						{labelText}{this.getLabelSuffix()}
					</label>
				}

				<div className={"textInput--inputWrapper" + this.getAnimatedPlaceholderClassName() + this.getValidClassName() + (disabled ? ' _disabled' : '')}>

					{animatedPlaceholder &&
						<label className="textInput--animatedPlaceholder" htmlFor={id}>
							{animatedPlaceholder}{this.getLabelSuffix()}
						</label>
					}


					{/* The rest of the properties are after ...otherProperties. This way ...otherProperties CANNOT overwrite them (e.g. onBlur will always be {this.onInputBlur}) */}
					<input type="text"
                           {...otherProperties}
						   className={"textInput--input" + this.getValidClassName()}
						   id={id}
                           ref={(element) => this.input = element}
                           placeholder={placeholder ? (placeholder + this.getLabelSuffix()) : ''}
                           disabled={disabled}
						   onChange={this.onInputChange}
                           onFocus={this.onInputFocus}
						   onBlur={this.onInputBlur} />
				</div>

				{errors && errors.length && errors[0] ? (
					// if this.props.errors is set and contains errors, show them (this.props.validationsAndErrors will be ignored)
					<ErrorMessage className="textInput--error" errorStack={errors}/>

				) : (
					// if this.props.errors is not set, we show the errors of the state which are created using this.props.validationsAndErrors
					( (isDirty !== undefined ? isDirty : this.state.inputIsDirty) &&
						<ErrorMessage className="textInput--error" errorStack={this.state.errors}/>
					)

				)}
			</div>
		);
	}

    componentDidMount() {
        // check if the input was intialized by code in a parent component, and if it was, update this.state.inputIsDirty and trigger onChange
        if (this.props.value && this.state.inputValue === "") {
            this.setState({inputIsDirty: true});
            this.onInputChange({
                target: {value: this.props.value},
                wasTriggeredManually: true,
                wasInitializedManually: true,
                wasUpdatedManually: false
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // this code is necessary in case we update the TextInput value modifying the state in the parent (not with user input).
        // In this case, we also run validations and update the dirty/active state of the input.
        var inputWasUpdatedManually = this.props.value !== prevProps.value && this.state.inputValue !== this.props.value;   // true if the input was updated by code in a parent component (not by user input)

        if (inputWasUpdatedManually) {
            this.onInputChange({
                target: {value: this.props.value},
                wasTriggeredManually: true, // We indicate that we've manually triggered onChange
                wasInitializedManually: false,
                wasUpdatedManually: inputWasUpdatedManually
            });

            if (!this.state.inputIsFocused) {
                // If the value was changed manually (by the code), and the user is not focused on the input, we make it dirty so that the valid/error icons can be displayed.
                // In case the user was focused on the input, it will become dirty as soon as they focus out of it.
                this.setState({ inputIsDirty: true });
            }
        }
    }

    //calculates the error class to be applied to an element (either "error", "valid" or "") depending on the errors and on whether the component is dirty or not
    getValidClassName() {

        var componentIsDirty = this.props.isDirty;
        var inputIsDirty = this.state.inputIsDirty;
        var errors = this.state.errors;
        var forcedErrors = this.props.errors;

        if( forcedErrors && forcedErrors.length && this.arrayHasNonEmptyValue(forcedErrors) ) {
            // if there are forced errors passed by the parent, ignore the rest of parameters and return the "error" class
            return " error";

        } else if ( !this.props.validationsAndErrors && !errors.length ) {
            // if there are no forced errors, we can look at the other parameters. If there's no validations to be done, return the "default" class
            return "";	// the "default" class is just an empty string
        }

        var isDirty = componentIsDirty !== undefined ? componentIsDirty : inputIsDirty;

        if (this.props.validationsAndErrors) {
            if(isDirty) {
                return (errors.length > 0) ? " error" : " valid";
            } else {
                return "";	// the input is neither valid nor invalid, so return the "default" class
            }

        } else {
            // there's no validationsAndErrors, so if the code reaches this point this means that the error has been generated by a forced error event
            // So in this case, show an error class if there are errors and the input is dirty, and nothing otherwise (there's no validation rules, so the input can't be valid!)
            return (isDirty && (errors.length > 0)) ? " error" : "";
        }
    }

    getAnimatedPlaceholderClassName() {

        if(this.props.animatedPlaceholder) {
            var animatedPlaceholderClassName = "animatedPlaceholder";

            if(this.props.isActive) {
                animatedPlaceholderClassName += " _active";
            } else {
                animatedPlaceholderClassName += this.state.inputValue ? " _active" : "";
            }

            return " " + animatedPlaceholderClassName;

        } else {
            return "";
        }
    }

    // This function generates a suffix to be appended to the label/placeholder of the input
    // The suffix will have different values (" *", " (required)", " (optional)") depending on this.props.
    getLabelSuffix() {
        if (this.props.showRequiredMark) {
            return '\u00a0*';
        } else if (this.props.showRequiredText) {
            return '\u00a0(required)';
        } else if (this.props.showOptionalText) {
            return '\u00a0(optional)';
        } else {
            return '';
        }
    }

    // handles error validation and also triggers the component's outer onChange handler
    onInputChange(event) {

        var currentInputValue = event.target.value;	// value of the input

        if( (typeof this.props.onChange) === 'function' ) {
            // trigger component's onChange so that the parent can handle it
            // It's important to do this before validating the input, because the parent component may have changed its value!
            if (event.wasTriggeredManually && event.wasUpdatedManually && !event.wasInitializedManually) {
                // If the event was triggered manually by the parent's code during an UPDATE (not initialization), we don't need to execute the parent's onChange event, because it was just triggered!
                var changedInputValue = currentInputValue;
            } else {
                // if the event was triggered just by the user input, or during a manual initialization, trigger the parent's onChange
                var changedInputValue = this.props.onChange(event);	// if the parent changes the input value on its onChange, it MUST return it or the TextInput won't be able to get the new value on time
            }

            if(changedInputValue || changedInputValue === "") {
                currentInputValue = changedInputValue;	// in case the parent has changed the input value, we will use this value to do the validations
            }
        }

        this.setState({ inputValue: currentInputValue });

        if( this.props.validationsAndErrors ) {
            // validate the input using the validationsAndErrors passed from the parent
            var allErrors = [];
            var errorIndexes = [];

            this.props.validationsAndErrors.map( (element, index) => {
                var validation = element.validation;
                var error = element.error;

                if( ((typeof validation) === "function") && !validation(currentInputValue)) {
                    // if the input value isn't valid, we'll show the error
                    allErrors.push(error);
                    errorIndexes.push(index);
                }
            } );

            this.setState({ errors: allErrors });

            if( errorIndexes.length > 0 && (typeof this.props.onError) === 'function' ) {
                this.props.onError(errorIndexes);	// trigger component's onError so that the parent can handle it

            } else if ( (typeof this.props.onValid) === 'function' ) {
                this.props.onValid(currentInputValue);	// if the input passes the validation, trigger onValid so that the parent can handle it
            }
        }
    }

    onInputFocus(event) {
        this.setState({ inputIsFocused: true });

        if( (typeof this.props.onFocus) === 'function' ) {
            this.props.onFocus(event);	// trigger component's onFocus so that the parent can handle it
        }
    }

    // sets this.state.inputIsDirty if the user loses the focus on the input and the input isn't empty
    onInputBlur(event) {
        this.setState((prevState, props) => {
            var inputIsDirty = prevState.inputIsDirty || prevState.inputValue !== "";
            return { inputIsDirty: inputIsDirty, inputIsFocused: false };
        });

        if( (typeof this.props.onBlur) === 'function' ) {
            this.props.onBlur(event);	// trigger component's onBlur so that the parent can handle it
        }
    }

    // returns the cursor position on the input in this format: {selectionStart: number, selectionEnd: number}
    // This function can be used in the parent component in case we need to get the cursor position of the input (edge case! only used in CreditCardForm as of May 2017)
    getCursorPosition() {
        if( this.input && (typeof this.input.selectionStart === 'number') && (typeof this.input.selectionEnd === 'number') ) {
            return {selectionStart: this.input.selectionStart, selectionEnd: this.input.selectionEnd};
        }
        return null;    // in IE < 9 this feature is not supported, hence we return null
    }

    // sets the position of the cursor on the input. We can specify both a start and an end.
    // This function can be used in the parent component in case we need to get the cursor position of the input (edge case! only used in CreditCardForm as of May 2017)
    setCursorPosition(start, end) {
        if( this.input && (typeof this.input.selectionStart === 'number') && (typeof this.input.selectionEnd === 'number') ) {
            if(typeof start === 'number') this.input.selectionStart = start;
            if(typeof end === 'number') this.input.selectionEnd = end;
        }
        // in IE < 9 this feature is not supported, we won't do anything in this case
    }

    // Checks if an array has at least one element that's not an empty value
    arrayHasNonEmptyValue(arr) {
        let length = arr.length;
        for(let i = 0; i < length; i++) {
            let element = arr[i];
            if(arr[i]) {
                return true;
            }
        }
        return false;
    }

}

export default TextInput;
