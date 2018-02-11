# React Healthy Model

Simple module for tracking state of a model.


```jsx
import { Model } from 'react-healthy-model'

/**
 * @typedef Health<T>
 * @type {object}
 * @property {boolean} invalid - this model has an invalid value
 * @property {boolean} touched - this model has been updated (non-reset)
 * @property {T} value - this model's value (assign your input[value] to this)
 * @property {{label: ?string, message: ?string}[]} errors - this model's errors
 * @property {{label: ?string, message: ?string}[]} warnings - this model's warnings
 * @property {{label: ?string, message: ?string}[]} notes - this model's notes
 */

/**
 * @param {string} props.name
 * @param {Health<string>} state.emailHealth
 */
class FormComponent extends React.Component {
  constructor(props) {
    super(props)

    // Create our model
    this.emailInputModel = new Model(
      // Initial zero value (Model::reset() uses this as default if you don't pass Model::reset(toValue: T))
      '',
      // onChange
      health => this.setState({emailHealth: health}),
      /** Array of validators (functions which take the value, and return a partial @type {Health}) */
      [ val => { const err = validateEmail(str); return err ? {errors: [{message: err}]} : null } ]
    )

    // Must set the initial state's health value
    this.state.emailHealth = this.emailInputModel.ZERO_HEALTH
  }
  
  render() {
    return <form name={this.props.name}>
      <div
        className={
          "form-control" +
          (this.state.emailHealth.invalid ? ' input-invalid' : '') +
          (this.state.emailHealth.touched ? ' input-touched' : '')
        }
      >
        <label for={this.props.name + '-email'}>Email Address</label>
        <input
          id={this.props.name + '-email'}
          {/* This is a controlled input directed by the model's health */}
          value={this.state.emailHealth.value}
          {/* and the model's update function */}
          onChange={this.emailInputModel.update}
        >
        <div className="input-errors">
          {this.state.emailHealth.errors.map(err =>
            <div className="input-detail input-detail-error" key={err.message}>{err.message}</div>
          )}
        </div>
      </div>
    </form>
  }
}

/**
 * @returns {string?} for error message, or it's valid
 */
function validateEmail(emailStr) {
  if ((emailStr || '').length > 0) return "Please provide your email address"
  if (!/@[-\w]{2,}\.[-\w]{2,}$/.test(emailStr)) return "Please include your @domain"
}

```

