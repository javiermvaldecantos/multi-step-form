import React, { Component } from 'react';
import './App.css';
import MultiStepForm from './components/MultiStepForm/MultiStepForm.jsx';
import TextInput from './components/TextInput/TextInput.jsx';
import RadioButtonsSelectInput from './components/RadioButtonsSelectInput/RadioButtonsSelectInput.jsx';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentStep: 1,
            firstName: '',
            lastName: '',
            gender: '',
            email: '',
            showErrorsOnEmail: false,
            formSubmitted: false
        }

        this.goToNextStep = this.goToNextStep.bind(this);
        this.isEmailValid = this.isEmailValid.bind(this);
    }

    render() {
        return (
            <div class="app">

                <MultiStepForm currentStep={this.state.currentStep} 
                            displayProgressBar={true}
                            displayFooter={true}
                            onGoToNextStep={this.goToNextStep} 
                            onGoToPreviousStep={ () => this.setState({ currentStep: (this.state.currentStep - 1) }) }
                            submitButtonContent="Submit"
                            onSubmit={ () => this.setState({formSubmitted: true}) }> 

                    <div className="multiStepForm--step">
                        <TextInput className="multiStepForm--firstName"
                                id="multiStepForm--firstName"
                                labelText="First Name"
                                value={this.state.firstName}
                                onChange={ (event) => this.setState({firstName: event.target.value}) } />
                        <TextInput className="multiStepForm--lastName"
                                id="multiStepForm--lastName"
                                labelText="Last Name"
                                value={this.state.lastName}
                                onChange={ (event) => this.setState({lastName: event.target.value}) } />
                    </div>

                    <div className="multiStepForm--step">
                        <p>Gender</p>
                        <RadioButtonsSelectInput outerClassName="multiStepForm--gender"
                                                 outerId="multiStepForm--gender"
                                                 name="gender"
                                                 buttonsContent={[
                                                     {'value': 'm', 'text': 'Male'},
                                                     {'value': 'f', 'text': 'Female'},
                                                     {'value': 'o', 'text': 'Other'}
                                                 ]}
                                                 selectedButtonValue={this.state.gender} 
                                                 onChange={ (event) => this.setState({gender: event.target.value}) } />
                        <TextInput className="multiStepForm--email"
                                id="multiStepForm--email"
                                labelText="Email"
                                value={this.state.email}
                                isDirty={this.state.showErrorsOnEmail ? true : undefined}
                                onChange={ (event) => this.setState({email: event.target.value}) }
                                validationsAndErrors={[ {validation: this.isEmailValid, error: 'Please fill out this field'} ]}
                                errors={ (this.state.showErrorsOnEmail && !this.isEmailValid(this.state.email)) ? ['Please fill out this field'] : undefined }
                                onValid={() => this.setState({emailIsInvalid: false})}
                                onError={() => this.setState({emailIsInvalid: true})} />
                    </div>

                    <div className="multiStepForm--step">
                        <p>First Name: {this.state.firstName || '-'}</p>
                        <p>Last Name: {this.state.lastName || '-'}</p>
                        <p>Gender: {this.state.gender === 'm' ? 'Male' : (this.state.gender === 'f' ? 'Female' : 'Other')}</p>
                        <p>Email: {this.state.email || '-'}</p>
                        <p>The "submit" button just prints a message, but it doesn't do anything else.</p>
                        {this.state.formSubmitted &&
                            <p><strong>Form submitted!</strong></p>
                        }
                    </div>

                </MultiStepForm>

            </div>
        );
    }

    goToNextStep() {
        if (this.state.currentStep === 2 && !this.isEmailValid(this.state.email)) {
            // the email is invalid, so we don't let the user go to the next step
            this.setState({showErrorsOnEmail: true});
        } else {
            this.setState({ currentStep: (this.state.currentStep + 1) });
        }
        
    }

    isEmailValid(email) {
        return !!email;
    }
}

export default App;