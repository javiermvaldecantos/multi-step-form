import React, { Component } from 'react';
import './_ErrorMessage.css';

/**
 * ErrorMessage
 * 
 * This component contains an error message to be shown under inputs or other form elements.
 * The goal of this component is to make error messages consistent. Therefore, when building components you should only use this to display error messages.
 * @param error: Error as a string (in case we only want to show a single error message)
 * @param errorStack: Error stack as an array of errors (in case we want to show multiple errors at the same time)
 */
const ErrorMessage = ({className, id, error, errorStack}) => {

	return (
		<div className={className ? ("errorMessage " + className) : "errorMessage"} id={id}>

			{error || errorStack &&	// only print error messages if these are defined

				<ul>
					{(errorStack && errorStack.constructor === Array) ? (	// if error stack is defined, print all the errors inside of it

						errorStack.map( (element, index) =>
							<li key={index} >{element}</li>
						)

					) : (	// if errorStack isn't defined, we'll print the single error message

						<li>{error}</li>

					)}
				</ul>

			}

		</div>
	);

}

export default ErrorMessage;