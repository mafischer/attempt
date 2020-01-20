const { expect } = require('chai');
const { attempt } = require('../lib');

describe(`attempt module`, () => {
    it('should export a function called attempt', (done) => {
        expect(attempt).not.equal(undefined);
        done();
    });
});