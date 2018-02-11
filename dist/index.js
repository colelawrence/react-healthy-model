// Version 0.0.1
export class Model {
    /**
     * Create new Model which keeps track of changes
     * @param _zero Zero value for the model
     * @param config configuration for what to do on update, must at least include onUpdate
     */
    constructor(_zero, config) {
        this._zero = _zero;
        this._checks = config.checks || [];
        this._value = this._zero;
        this._touched = false;
        this._onUpdate = config.onUpdate;
        this.ZERO_HEALTH = createZeroHealth(this._zero);
        this.update = this.update.bind(this);
        this.reset = this.reset.bind(this);
    }
    update(value, touched = true) {
        this._touched = touched;
        return checkValueHealths(value, this._checks)
            .then(partialHealths => {
            return combineHealths(partialHealths, value, this._touched);
        })
            .then(this._onUpdate);
    }
    reset(value = this._zero) {
        return this.update(value, false);
    }
}
export function checkValueHealths(value, checks) {
    const checkPromises = checks
        .map(checkFn => checkFn(value))
        .map(res => Promise.resolve(res));
    return Promise.all(checkPromises);
}
export function createZeroHealth(value, touched = false) {
    return {
        value: value,
        invalid: false,
        touched: touched,
        notes: [],
        warnings: [],
        errors: [],
    };
}
export function combineHealths(healths, value, touched) {
    return healths.reduce((prev, curr) => {
        if (curr == null)
            return prev;
        if (curr.invalid)
            prev.invalid = true;
        if (curr.notes != null && curr.notes.length > 0)
            prev.notes = prev.notes.concat(curr.notes);
        if (curr.warnings != null && curr.warnings.length > 0)
            prev.warnings = prev.warnings.concat(curr.warnings);
        if (curr.errors != null && curr.errors.length > 0) {
            prev.errors = prev.errors.concat(curr.errors);
            prev.invalid = true;
        }
        return prev;
    }, createZeroHealth(value, touched));
}
//# sourceMappingURL=index.js.map