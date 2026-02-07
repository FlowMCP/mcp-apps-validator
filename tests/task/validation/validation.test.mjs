import { describe, test, expect } from '@jest/globals'

import { Validation } from '../../../src/task/Validation.mjs'

import { TEST_ENDPOINT } from '../../helpers/config.mjs'


describe( 'Validation', () => {

    describe( 'validationStart', () => {

        test( 'returns error when endpoint is missing', () => {
            const { status, messages } = Validation.validationStart( {} )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-001' ) )
        } )


        test( 'returns error when endpoint is not a string', () => {
            const { status, messages } = Validation.validationStart( { endpoint: 42 } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-002' ) )
        } )


        test( 'returns error when endpoint is empty', () => {
            const { status, messages } = Validation.validationStart( { endpoint: '  ' } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-003' ) )
        } )


        test( 'returns error when endpoint is invalid URL', () => {
            const { status, messages } = Validation.validationStart( { endpoint: 'not-a-url' } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-004' ) )
        } )


        test( 'returns error when timeout is not a number', () => {
            const { status, messages } = Validation.validationStart( { endpoint: TEST_ENDPOINT, timeout: 'fast' } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-005' ) )
        } )


        test( 'returns error when timeout is zero', () => {
            const { status, messages } = Validation.validationStart( { endpoint: TEST_ENDPOINT, timeout: 0 } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-006' ) )
        } )


        test( 'returns error when timeout is negative', () => {
            const { status, messages } = Validation.validationStart( { endpoint: TEST_ENDPOINT, timeout: -1 } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-006' ) )
        } )


        test( 'returns success with valid endpoint', () => {
            const { status, messages } = Validation.validationStart( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )


        test( 'returns success with valid endpoint and timeout', () => {
            const { status, messages } = Validation.validationStart( { endpoint: TEST_ENDPOINT, timeout: 5000 } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )
    } )


    describe( 'validationCompare', () => {

        const validSnapshot = {
            categories: { isReachable: true },
            entries: { endpoint: TEST_ENDPOINT }
        }


        test( 'returns error when before is missing', () => {
            const { status, messages } = Validation.validationCompare( { after: validSnapshot } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-010' ) )
        } )


        test( 'returns error when before is not an object', () => {
            const { status, messages } = Validation.validationCompare( { before: 'invalid', after: validSnapshot } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-011' ) )
        } )


        test( 'returns error when before is null', () => {
            const { status, messages } = Validation.validationCompare( { before: null, after: validSnapshot } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-011' ) )
        } )


        test( 'returns error when before is an array', () => {
            const { status, messages } = Validation.validationCompare( { before: [], after: validSnapshot } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-011' ) )
        } )


        test( 'returns error when before is missing categories or entries', () => {
            const { status, messages } = Validation.validationCompare( { before: { foo: true }, after: validSnapshot } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-012' ) )
        } )


        test( 'returns error when after is missing', () => {
            const { status, messages } = Validation.validationCompare( { before: validSnapshot } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-013' ) )
        } )


        test( 'returns error when after is not an object', () => {
            const { status, messages } = Validation.validationCompare( { before: validSnapshot, after: 42 } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-014' ) )
        } )


        test( 'returns error when after is missing categories or entries', () => {
            const { status, messages } = Validation.validationCompare( { before: validSnapshot, after: { foo: true } } )

            expect( status ).toBe( false )
            expect( messages ).toContainEqual( expect.stringContaining( 'VAL-015' ) )
        } )


        test( 'returns success with valid snapshots', () => {
            const { status, messages } = Validation.validationCompare( { before: validSnapshot, after: validSnapshot } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )
    } )


    describe( 'error', () => {

        test( 'throws with joined messages', () => {
            expect( () => {
                Validation.error( { messages: [ 'VAL-001 endpoint: Missing value', 'VAL-005 timeout: Must be a number' ] } )
            } ).toThrow( 'VAL-001 endpoint: Missing value, VAL-005 timeout: Must be a number' )
        } )


        test( 'throws with single message', () => {
            expect( () => {
                Validation.error( { messages: [ 'VAL-001 endpoint: Missing value' ] } )
            } ).toThrow( 'VAL-001 endpoint: Missing value' )
        } )
    } )
} )
