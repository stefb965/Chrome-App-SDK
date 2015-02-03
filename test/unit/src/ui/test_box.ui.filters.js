describe('box.ui.filters', function() {
    describe('bytes', function() {
        var bytes;
        beforeEach(function() {
            module('box.ui', 'ui.bootstrap');
        });
        beforeEach(inject(function($filter) {
            bytes = $filter('bytes');
        }));
        ['Infinity', 'NaN', 'foo'].forEach(function(invalidBytes) {
            it('should return - for invalid input(' + invalidBytes + ')', function() {
                expect(bytes(invalidBytes)).to.equal('-');
            });
        });

        it('should return 0 bytes for 0 input', function() {
            expect(bytes('0')).to.equal('0 bytes');
        });

        [
            {number: 1, precision: 1, output: '1.0 bytes'},
            {number: 1, precision: 0, output: '1 bytes'},
            {number: 1023, precision: 0, output: '1023 bytes'},
            {number: 1024, precision: 0, output: '1 kB'}
        ].forEach(function(expected) {
            it('should return the expected number with the expected precision (' + expected.precision + ') for input number ' + expected.number, function() {
                expect(bytes(expected.number, expected.precision)).to.equal(expected.output);
            });
        });
    });
});
