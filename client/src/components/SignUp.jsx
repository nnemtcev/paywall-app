import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import NavBar from "./Navbar.jsx";
import { ValidatorForm } from "react-form-validator-core";
import { TextValidator } from "react-material-ui-form-validator";

// Component that handles the sign-up process
// Includes state in order to make sure components are controlled

class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        password: "",
        avatarUrl: "",
      },
      submitted: false,
      didSignupFail: false,
      errorCode: null,
    };
  }

  // Function that handles the inputs in the sign-up form
  // as they are typed in, makes SignUp a controlled component

  handleInputChanges(event) {
    const { formData } = this.state;
    formData[event.target.name] = event.target.value;
    this.setState({ formData });
  }

  // Handles the sign-up process when a user clicks on the sign-up button.

  signUserUp() {
    this.setState({ submitted: true }, () => {
      setTimeout(() => this.setState({ submitted: false }), 5000);
    });

    let user = this.state.formData;

    // Use Axios to send an HTTP POST request to the /signup endpoint
    // where a new user will be created with the data in the form state
    // and then redirect the user to the homepage

    axios
      .post("/signup", user)
      .then((response) => {
        let userId = response.data.userId;
        this.props.logUserIn(userId);
        this.props.history.push("/");
      })
      .catch((error) => {
        if (error.response && error.response.status === 422) {
          console.log("error authenticating user errors", error.response);
          this.setState({
            didSignupFail: true,
            errorCode: 422,
          });
        } else {
          console.log("Error in component", error.response);
          this.setState({
            didSignupFail: true,
            errorCode: 500,
          });
        }
      });
  }

  componentWillMount() {
    // Use the ValidatorForm package to add a new validation rule
    // where we compare the two passwords to see if they are equal to each other

    ValidatorForm.addValidationRule("isPasswordMatch", (value) => {
      if (value !== this.state.formData.password) {
        return false;
      }

      return true;
    });
  }

  render() {
    const { formData } = this.state;
    return (
      <div>
        <NavBar isLoggedIn={false} />
        <div className="body-container">
          <div className="form">
            <ValidatorForm
              ref="form"
              onSubmit={this.signUserUp.bind(this)}
              onError={(errors) => console.log(errors)}
            >
              <TextValidator
                floatingLabelText="Username"
                onChange={this.handleInputChanges.bind(this)}
                name="username"
                value={formData.username}
                validators={[
                  "required",
                  "isString",
                  "minStringLength:4",
                  "maxStringLength:20",
                ]}
                errorMessages={[
                  "This field is required",
                  "Invalid input",
                  "Must be at least 4 character",
                  "Must not exceed 20 characters",
                ]}
              />
              <br />
              <TextValidator
                floatingLabelText="First Name"
                onChange={this.handleInputChanges.bind(this)}
                name="firstName"
                value={formData.firstName}
                validators={[
                  "required",
                  "isString",
                  "minStringLength:1",
                  "maxStringLength:20",
                ]}
                errorMessages={[
                  "This field is required",
                  "Invalid input",
                  "This field is required",
                  "Must not exceed 20 characters",
                ]}
              />
              <br />
              <TextValidator
                floatingLabelText="Last Name"
                onChange={this.handleInputChanges.bind(this)}
                name="lastName"
                value={formData.lastName}
                validators={[
                  "required",
                  "isString",
                  "minStringLength:1",
                  "maxStringLength:20",
                ]}
                errorMessages={[
                  "This field is required",
                  "Invalid input",
                  "This field is required",
                  "Must not excede 20 characters",
                ]}
              />
              <br />
              <TextValidator
                floatingLabelText="Email Address"
                onChange={this.handleInputChanges.bind(this)}
                name="email"
                value={formData.email}
                validators={[
                  "required",
                  "isEmail",
                  "minStringLength:7",
                  "maxStringLength:64",
                ]}
                errorMessages={[
                  "This field is required",
                  "Not a valid email address",
                  "Must enter a unique email address",
                  "Must not excede 64 characters",
                ]}
              />
              <br />
              <TextValidator
                floatingLabelText="Phone Number"
                onChange={this.handleInputChanges.bind(this)}
                name="phone"
                value={formData.phone}
                validators={[
                  "required",
                  "isNumber",
                  "minStringLength:10",
                  "maxStringLength:11",
                ]}
                errorMessages={[
                  "This field is required",
                  "Not a valid phone number",
                  "Example: 7895551234",
                  "Must not excede 11 characters",
                ]}
              />
              <br />
              <TextValidator
                floatingLabelText="Password"
                onChange={this.handleInputChanges.bind(this)}
                name="password"
                type="password"
                value={formData.password}
                validators={[
                  "required",
                  "isString",
                  "minStringLength:4",
                  "maxStringLength:64",
                ]}
                errorMessages={[
                  "This field is required",
                  "Not a valid email address",
                  "Must be at least 4 character",
                  "Must not excede 64 characters",
                ]}
              />
              <br />
              <TextValidator
                floatingLabelText="Re-enter password"
                onChange={this.handleInputChanges.bind(this)}
                name="repeatPassword"
                type="password"
                value={formData.repeatPassword}
                validators={["required", "isPasswordMatch"]}
                errorMessages={[
                  "This field is required",
                  "Must match previous field",
                ]}
              />
              <br />
              <TextValidator
                floatingLabelText="Avatar URL (Optional)"
                onChange={this.handleInputChanges.bind(this)}
                value={formData.avatarUrl}
                name="avatarUrl"
              />
              <br />
              <div>
                <button className="btn" onClick={this.signUserUp.bind(this)}>
                  Create Account
                </button>
                {this.state.didSignupFail && (
                  <span className="error-text">
                    {this.state.errorCode === 422 ? (
                      <span>
                        The username, phone number, or email is not unique.
                        Please try again.
                      </span>
                    ) : (
                      <span>
                        Our servers are having issues. Please try later!
                      </span>
                    )}
                  </span>
                )}
              </div>
            </ValidatorForm>
            <div>
              <br />
              <span>Already a member?</span>
              <br />
              <Link to="/login">
                <button className="btn">Sign in</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SignUp;
