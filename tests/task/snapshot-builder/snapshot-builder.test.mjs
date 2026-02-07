import { describe, test, expect } from '@jest/globals'

import { SnapshotBuilder } from '../../../src/task/SnapshotBuilder.mjs'

import {
    MOCK_SERVER_INFO,
    MOCK_TOOLS,
    MOCK_RESOURCES,
    MOCK_CAPABILITIES_WITH_UI,
    MOCK_LATENCY,
    EXPECTED_CATEGORY_KEYS,
    EXPECTED_ENTRY_KEYS,
    EMPTY_CATEGORIES,
    TEST_ENDPOINT
} from '../../helpers/config.mjs'


const MOCK_UI_RESOURCES = [
    { uri: 'ui://weather-dashboard', name: 'Weather Dashboard', mimeType: 'text/html;profile=mcp-app' }
]

const MOCK_UI_LINKED_TOOLS = [
    { name: 'get_weather', resourceUri: 'ui://weather-dashboard', visibility: [ 'model', 'app' ] },
    { name: 'refresh_dashboard', resourceUri: 'ui://weather-dashboard', visibility: [ 'app' ] }
]

const MOCK_VALIDATED_RESOURCES = [
    {
        uri: 'ui://weather-dashboard',
        hasCsp: true,
        hasPermissions: true,
        hasTheming: false,
        displayModes: [],
        hasGracefulDegradation: false
    }
]

const MOCK_PARTIAL_CATEGORIES = {
    supportsMcpApps: true,
    hasUiResources: true,
    hasUiToolLinkage: true,
    hasValidUiHtml: true,
    hasValidCsp: true,
    supportsTheming: false,
    supportsDisplayModes: false,
    hasToolVisibility: true,
    hasValidPermissions: true,
    hasGracefulDegradation: false
}


describe( 'SnapshotBuilder', () => {

    describe( 'build', () => {

        test( 'returns all 12 category keys', () => {
            const { categories } = SnapshotBuilder.build( {
                endpoint: TEST_ENDPOINT,
                serverInfo: MOCK_SERVER_INFO,
                tools: MOCK_TOOLS,
                resources: MOCK_RESOURCES,
                capabilities: MOCK_CAPABILITIES_WITH_UI,
                partialCategories: MOCK_PARTIAL_CATEGORIES,
                uiResources: MOCK_UI_RESOURCES,
                uiLinkedTools: MOCK_UI_LINKED_TOOLS,
                validatedResources: MOCK_VALIDATED_RESOURCES,
                latency: MOCK_LATENCY
            } )

            EXPECTED_CATEGORY_KEYS
                .forEach( ( key ) => {
                    expect( categories ).toHaveProperty( key )
                } )

            expect( Object.keys( categories ).length ).toBe( 12 )
        } )


        test( 'sets isReachable and supportsMcp to true', () => {
            const { categories } = SnapshotBuilder.build( {
                endpoint: TEST_ENDPOINT,
                serverInfo: MOCK_SERVER_INFO,
                tools: MOCK_TOOLS,
                resources: MOCK_RESOURCES,
                capabilities: MOCK_CAPABILITIES_WITH_UI,
                partialCategories: MOCK_PARTIAL_CATEGORIES,
                uiResources: MOCK_UI_RESOURCES,
                uiLinkedTools: MOCK_UI_LINKED_TOOLS,
                validatedResources: MOCK_VALIDATED_RESOURCES,
                latency: MOCK_LATENCY
            } )

            expect( categories['isReachable'] ).toBe( true )
            expect( categories['supportsMcp'] ).toBe( true )
        } )


        test( 'returns all expected entry keys', () => {
            const { entries } = SnapshotBuilder.build( {
                endpoint: TEST_ENDPOINT,
                serverInfo: MOCK_SERVER_INFO,
                tools: MOCK_TOOLS,
                resources: MOCK_RESOURCES,
                capabilities: MOCK_CAPABILITIES_WITH_UI,
                partialCategories: MOCK_PARTIAL_CATEGORIES,
                uiResources: MOCK_UI_RESOURCES,
                uiLinkedTools: MOCK_UI_LINKED_TOOLS,
                validatedResources: MOCK_VALIDATED_RESOURCES,
                latency: MOCK_LATENCY
            } )

            EXPECTED_ENTRY_KEYS
                .forEach( ( key ) => {
                    expect( entries ).toHaveProperty( key )
                } )
        } )


        test( 'extracts server info correctly', () => {
            const { entries } = SnapshotBuilder.build( {
                endpoint: TEST_ENDPOINT,
                serverInfo: MOCK_SERVER_INFO,
                tools: MOCK_TOOLS,
                resources: MOCK_RESOURCES,
                capabilities: MOCK_CAPABILITIES_WITH_UI,
                partialCategories: MOCK_PARTIAL_CATEGORIES,
                uiResources: MOCK_UI_RESOURCES,
                uiLinkedTools: MOCK_UI_LINKED_TOOLS,
                validatedResources: MOCK_VALIDATED_RESOURCES,
                latency: MOCK_LATENCY
            } )

            expect( entries['serverName'] ).toBe( 'test-mcp-apps-server' )
            expect( entries['serverVersion'] ).toBe( '1.0.0' )
            expect( entries['protocolVersion'] ).toBe( '2025-03-26' )
        } )


        test( 'extracts extension version', () => {
            const { entries } = SnapshotBuilder.build( {
                endpoint: TEST_ENDPOINT,
                serverInfo: MOCK_SERVER_INFO,
                tools: MOCK_TOOLS,
                resources: MOCK_RESOURCES,
                capabilities: MOCK_CAPABILITIES_WITH_UI,
                partialCategories: MOCK_PARTIAL_CATEGORIES,
                uiResources: MOCK_UI_RESOURCES,
                uiLinkedTools: MOCK_UI_LINKED_TOOLS,
                validatedResources: MOCK_VALIDATED_RESOURCES,
                latency: MOCK_LATENCY
            } )

            expect( entries['extensionVersion'] ).toBe( '2026-01-26' )
        } )


        test( 'counts ui resources and linked tools', () => {
            const { entries } = SnapshotBuilder.build( {
                endpoint: TEST_ENDPOINT,
                serverInfo: MOCK_SERVER_INFO,
                tools: MOCK_TOOLS,
                resources: MOCK_RESOURCES,
                capabilities: MOCK_CAPABILITIES_WITH_UI,
                partialCategories: MOCK_PARTIAL_CATEGORIES,
                uiResources: MOCK_UI_RESOURCES,
                uiLinkedTools: MOCK_UI_LINKED_TOOLS,
                validatedResources: MOCK_VALIDATED_RESOURCES,
                latency: MOCK_LATENCY
            } )

            expect( entries['uiResourceCount'] ).toBe( 1 )
            expect( entries['uiLinkedToolCount'] ).toBe( 2 )
            expect( entries['appOnlyToolCount'] ).toBe( 1 )
        } )


        test( 'includes latency', () => {
            const { entries } = SnapshotBuilder.build( {
                endpoint: TEST_ENDPOINT,
                serverInfo: MOCK_SERVER_INFO,
                tools: MOCK_TOOLS,
                resources: MOCK_RESOURCES,
                capabilities: MOCK_CAPABILITIES_WITH_UI,
                partialCategories: MOCK_PARTIAL_CATEGORIES,
                uiResources: MOCK_UI_RESOURCES,
                uiLinkedTools: MOCK_UI_LINKED_TOOLS,
                validatedResources: MOCK_VALIDATED_RESOURCES,
                latency: MOCK_LATENCY
            } )

            expect( entries['latency']['listResources'] ).toBe( 80 )
            expect( entries['latency']['readResource'] ).toBe( 150 )
        } )


        test( 'includes timestamp', () => {
            const { entries } = SnapshotBuilder.build( {
                endpoint: TEST_ENDPOINT,
                serverInfo: MOCK_SERVER_INFO,
                tools: MOCK_TOOLS,
                resources: MOCK_RESOURCES,
                capabilities: MOCK_CAPABILITIES_WITH_UI,
                partialCategories: MOCK_PARTIAL_CATEGORIES,
                uiResources: MOCK_UI_RESOURCES,
                uiLinkedTools: MOCK_UI_LINKED_TOOLS,
                validatedResources: MOCK_VALIDATED_RESOURCES,
                latency: MOCK_LATENCY
            } )

            expect( entries['timestamp'] ).toBeDefined()
            expect( typeof entries['timestamp'] ).toBe( 'string' )
        } )
    } )


    describe( 'buildEmpty', () => {

        test( 'returns all 12 category keys set to false', () => {
            const { categories } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            EXPECTED_CATEGORY_KEYS
                .forEach( ( key ) => {
                    expect( categories[key] ).toBe( false )
                } )
        } )


        test( 'returns null server info', () => {
            const { entries } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            expect( entries['serverName'] ).toBeNull()
            expect( entries['serverVersion'] ).toBeNull()
            expect( entries['protocolVersion'] ).toBeNull()
            expect( entries['extensionVersion'] ).toBeNull()
        } )


        test( 'returns zero counts', () => {
            const { entries } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            expect( entries['uiResourceCount'] ).toBe( 0 )
            expect( entries['uiLinkedToolCount'] ).toBe( 0 )
            expect( entries['appOnlyToolCount'] ).toBe( 0 )
        } )


        test( 'returns empty arrays', () => {
            const { entries } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            expect( entries['uiResources'] ).toEqual( [] )
            expect( entries['uiLinkedTools'] ).toEqual( [] )
            expect( entries['tools'] ).toEqual( [] )
            expect( entries['resources'] ).toEqual( [] )
            expect( entries['displayModes'] ).toEqual( [] )
        } )


        test( 'returns null latency values', () => {
            const { entries } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            expect( entries['latency']['listResources'] ).toBeNull()
            expect( entries['latency']['readResource'] ).toBeNull()
        } )


        test( 'preserves endpoint', () => {
            const { entries } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            expect( entries['endpoint'] ).toBe( TEST_ENDPOINT )
        } )
    } )
} )
