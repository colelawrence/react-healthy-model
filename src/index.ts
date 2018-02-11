// Version 0.0.1

export namespace Model {
  export type Status = {
    message?: string
    label?: string
  }

  export type Health<T> = {
    value: T
    invalid: boolean
    touched: boolean
    errors: Status[]
    notes: Status[]
    warnings: Status[]
  }

  export type CheckSyncFn<T> = (value: T) => Partial<Health<T>>
  export type CheckAsyncFn<T> = (value: T) => Promise<Partial<Health<T>>>
  export type CheckFn<T> = CheckSyncFn<T> | CheckAsyncFn<T>

  export type Config<T, U = any> = {
    onUpdate: (health: Health<T>) => U
    checks?: CheckFn<T>[]
    checkRace?: boolean
  }

  export interface IModel<T, U = any> {
    ZERO_HEALTH: Health<T>
    update(value: T): Promise<U>
    reset(value?: T): Promise<U>
  }
}

export class Model<T, U = any> implements Model.IModel<T> {
  private _value: T
  private _touched: boolean
  private _checks: Model.CheckFn<T>[]
  private _onUpdate: (health: Model.Health<T>) => U

  /**
   * Initial health value for your state
   */
  ZERO_HEALTH: Model.Health<T>

  /**
   * Create new Model which keeps track of changes
   * @param _zero Zero value for the model
   * @param config configuration for what to do on update, must at least include onUpdate
   */
  constructor(private _zero: T, config: Model.Config<T, U>) {
    this._checks = config.checks || []
    this._value = this._zero
    this._touched = false
    this._onUpdate = config.onUpdate
    this.ZERO_HEALTH = createZeroHealth(this._zero)
    this.update = this.update.bind(this)
    this.reset = this.reset.bind(this)
  }

  update(value: T, touched = true): Promise<U> {
    this._touched = touched
    return checkValueHealths(value, this._checks)
      .then(partialHealths => {
        return combineHealths(partialHealths, value, this._touched)
      })
      .then(this._onUpdate);
  }

  reset(value: T = this._zero): Promise<U> {
    return this.update(value, false)
  }
}

export function checkValueHealths<T>(value: T, checks: Model.CheckFn<T>[]): Promise<Partial<Model.Health<T>>[]> {
  const checkPromises = checks
    .map(checkFn => checkFn(value))
    .map(res => Promise.resolve(res));
  return Promise.all(checkPromises);
}

export function createZeroHealth<T>(value: T, touched: boolean = false): Model.Health<T> {
  return {
    value: value,
    invalid: false,
    touched: touched,
    notes: [],
    warnings: [],
    errors: [],
  }
}

export function combineHealths<T>(healths: Partial<Model.Health<T>>[], value: T, touched: boolean): Model.Health<T> {
  return healths.reduce<Model.Health<T>>(
    (prev: Model.Health<T>, curr: Partial<Model.Health<T>> | null) => {
      if (curr == null) return prev
      if (curr.invalid) prev.invalid = true
      if (curr.notes != null && curr.notes.length > 0) prev.notes = prev.notes.concat(curr.notes)
      if (curr.warnings != null && curr.warnings.length > 0) prev.warnings = prev.warnings.concat(curr.warnings)
      if (curr.errors != null && curr.errors.length > 0) {
        prev.errors = prev.errors.concat(curr.errors)
        prev.invalid = true
      }
      return prev
    },
    createZeroHealth(value, touched)
  );
}
