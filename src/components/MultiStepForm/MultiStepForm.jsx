import React, { Component } from 'react';
import './_MultiStepForm.css';

/**
 * MultiStepForm
 *
 * This component is a customizable multi-step form. The steps have to be wrapped in elements with the class "multiStepForm--step". For example:
 * <MultiStepForm>
 *      <div className="multiStepForm--step">Content of step 1</div>
 *      <div className="multiStepForm--step">Content of step 2</div>
 *      <div className="multiStepForm--step">Content of step 3</div>
 * </MultiStepForm>
 *
 * @param displayProgressBar: true to display a progress bar on the top of the form.
 * @param displayFooter: true to display the form footer, false to hide it. If the footer is hidden, you will have to create your own next/submit buttons on the steps.
 * @param displayBackButtonOnFooter: true to display a "back" button on the footer of the form
 * @param currentStep: Optional parameter to control the current step from the parent component.
 *                     If you want to control with logic whether to go to the next/previous step, you MUST use this.
 * @param onGoToNextStep: Handler function to be executed when the user clicks on "next" button. It will never get triggered if we're in the last step.
 * @param onGoToPreviousStep: Handler function to be executed when the user clicks on "back" button. It will never get triggered if we're in the first step.
 * @param onSkip: Handler function to be executed when the form is skipped completely. If this function is set, the form will show a "skip" button on the top of each step.
 * @param submitButtonContent: Content of the submit button, which is to be shown instead of the "next" button at the last step of the form. Accepts both text and markup.
 * @param onSubmit: Hanlder function to be executed when the user clicks on the final step button (i.e. when the form is submitted).
 */
class MultiStepForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentStep: props.currentStep !== undefined ? props.currentStep : 1,   // If the parent sets props.currentStep, we use it and ignore our own state variable
            formWidth: 0    // width of the multi-step form
        }

        this.numberOfSteps = 0;
        const childrenLength = this.props.children ? this.props.children.length : 0;
        for(let i = 0; i < childrenLength; i++) {   // Valid steps are only the children with the class "multiStepForm--step"
            let element = this.props.children[i];
            if(element.props && element.props.className === "multiStepForm--step") {
                this.numberOfSteps++;
            }
        }

        this.formRef = null;    // ref to the form, in order to get the form width

        this.getStepStyle = this.getStepStyle.bind(this);
        this.onBackButtonClick = this.onBackButtonClick.bind(this);
        this.onNextButtonClick = this.onNextButtonClick.bind(this);
        this.onMultiStepFormSubmit = this.onMultiStepFormSubmit.bind(this);
    }

    render() {
        // If the parent sets this.props.currentStep, we use it and ignore our own state variable
        const _currentStep = this.props.currentStep !== undefined ? this.props.currentStep : this.state.currentStep;

        return (
            <form className="multiStepForm"
                  data-current-step={_currentStep}
                  autoComplete={this.props.autoComplete}
                  ref={(element) => this.formRef = element}
                  onSubmit={(event) => this.onMultiStepFormSubmit(event, _currentStep)}>

                <div className="multiStepForm--header">
                    {/* Nothing in the header for now */}
                </div>

                {this.props.displayProgressBar &&
                    <div className="multiStepForm--progressBar">
                        <span className="multiStepForm--progress" style={{width: (100 * _currentStep / this.numberOfSteps) + '%' }}></span>
                    </div>
                }

                <div className="multiStepForm--body clearfix">
                    {this.props.children && this.props.children.map((child, index) =>
                        (child.props && child.props.className === "multiStepForm--step" &&
                            <div className={'multiStepForm--step-' + (index+1) + ((index+1) === _currentStep ? ' multiStepForm--currentStep' : '')}
                                 key={index}
                                 style={this.getStepStyle(index, _currentStep)}>

                                <div className="multiStepForm--stepHeader">
                                    {/* link/button to go to the previous step */}
                                    <a className="multiStepForm--backLink"
                                       role="button"
                                       href="javascript:void(0)"
                                       onClick={(event) => this.onBackButtonClick(event, _currentStep)}>
                                        Back
                                    </a>

                                    {(typeof this.props.onSkip === 'function') &&
                                        <a className="multiStepForm--skipLink"
                                           role="button"
                                           href="javascript:void(0)"
                                           onClick={this.props.onSkip}>
                                            Skip
                                        </a>
                                    }
                                </div>

                                {child.props.children /* Content of the step is loaded here */}

                            </div>
                        )
                    )}
                </div>

                {this.props.displayFooter &&
                    // footer (displayed separately from the steps)
                    <div className={'multiStepForm--footer clearfix' + (this.props.displayBackButtonOnFooter ? ' multiStepForm--footerWithBackButton' : '')}>
                        <button className={'multiStepForm--backButton btn-base' + (_currentStep > 1 ? '' : ' hidden')}
                                type="button"
                                data-test="multiStepForm--backButton"
                                onClick={(event) => this.onBackButtonClick(event, _currentStep)}>
                            Back
                        </button>
                        <button className={'multiStepForm--nextButton btn-base' + (_currentStep > 0 && _currentStep < this.numberOfSteps ? '' : ' hidden')}
                                data-test="multiStepForm--nextButton"
                                type="button"
                                onClick={(event) => this.onNextButtonClick(event, _currentStep)}>
                            Next
                        </button>
                        <button className={'multiStepForm--submitButton btn-base' + (_currentStep === this.numberOfSteps && this.props.submitButtonContent ? '' : ' hidden')}
                                data-test="multiStepForm--submitButton"
                                type="submit">
                            {this.props.submitButtonContent}
                        </button>
                    </div>
                }

            </form>
        );
    }

    componentDidMount() {
        if (this.formRef) {
            const rectangle = this.formRef.getBoundingClientRect();
            this.setState({formWidth: rectangle.width});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentStep !== undefined && this.props.currentStep !== prevProps.currentStep) {
            this.setState({currentStep: this.props.currentStep});   // if the parent is controlling the current step, copy it to the state
        }
    }

    onBackButtonClick(event, currentStep) {
        if(currentStep > 1) {
            if (this.props.currentStep === undefined) {
                // If the parent isn't controlling the currentStep, update it. Otherwise do nothing - the state will be updated in componentDidUpdate()
                this.setState({ currentStep: currentStep - 1 });
            }

            if (typeof this.props.onGoToPreviousStep === 'function') {
                this.props.onGoToPreviousStep();
            }
        }
    }

    onNextButtonClick(event, currentStep) {
        if (currentStep < this.numberOfSteps) {
            if (this.props.currentStep === undefined) {
                // If the parent isn't controlling the currentStep, update it. Otherwise do nothing - the state will be updated in componentDidUpdate()
                this.setState({ currentStep: currentStep + 1 });
            }

            if (typeof this.props.onGoToNextStep === 'function') {
                this.props.onGoToNextStep();
            }
        }
    }

    /**
     * onMultiStepFormSubmit
     *
     * This function is the onSubmit handler of the form.
     * It can get triggered when the user clicks on the "submit" button, OR when the user presses ENTER when focusing on an input.
     * Therefore we have to consider the cases of being in the final step, and being in any other step.
     */
    onMultiStepFormSubmit(event, currentStep) {
        event.preventDefault();

        if (currentStep === this.numberOfSteps) {
            // We're in the final step. Submit the form.
            if(typeof this.props.onSubmit === 'function') {
                this.props.onSubmit(event);
            }
        } else {
            // We're not in the final step. Go to the next step.
            this.onNextButtonClick(event, currentStep);
        }
    }

    /**
     * getStepStyle
     *
     * Generates the style that will show/hide a specific step of the form
     * @param stepIndex Index of the step of which we want to calculate the style.
     * @param currentStep Current step that the form is at
     */
    getStepStyle(stepIndex, currentStep) {
        if ((stepIndex + 1) < currentStep) { // one of the previous steps
            return {'transform':'translate(-' + this.state.formWidth + 'px,0)'};
        } else if ((stepIndex + 1) > currentStep) {  // one of the future steps
            return {'transform':'translate(' + this.state.formWidth + 'px,0)'};
        } else {    // current step
            return {'transform':'translate(0,0)'};
        }
    }

}

export default MultiStepForm;
