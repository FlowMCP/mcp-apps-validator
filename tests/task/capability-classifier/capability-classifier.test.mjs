import { describe, test, expect } from '@jest/globals'

import { CapabilityClassifier } from '../../../src/task/CapabilityClassifier.mjs'

import {
    MOCK_CAPABILITIES,
    MOCK_CAPABILITIES_WITH_UI
} from '../../helpers/config.mjs'


const MOCK_UI_RESOURCES = [
    { uri: 'ui://dashboard', name: 'Dashboard' }
]

const MOCK_UI_LINKED_TOOLS = [
    { name: 'get_weather', resourceUri: 'ui://dashboard', visibility: [ 'model', 'app' ] },
    { name: 'refresh', resourceUri: 'ui://dashboard', visibility: [ 'app' ] }
]

const MOCK_VALIDATED_RESOURCES = [
    {
        uri: 'ui://dashboard',
        hasCsp: true,
        hasPermissions: true,
        hasTheming: true,
        displayModes: [ 'inline', 'fullscreen' ],
        hasGracefulDegradation: true
    }
]

const MOCK_VALIDATED_RESOURCES_MINIMAL = [
    {
        uri: 'ui://dashboard',
        hasCsp: false,
        hasPermissions: false,
        hasTheming: false,
        displayModes: [],
        hasGracefulDegradation: false
    }
]


describe( 'CapabilityClassifier', () => {

    test( 'classifies full capabilities correctly', () => {
        const { categories } = CapabilityClassifier.classify( {
            capabilities: MOCK_CAPABILITIES_WITH_UI,
            uiResources: MOCK_UI_RESOURCES,
            uiLinkedTools: MOCK_UI_LINKED_TOOLS,
            validatedResources: MOCK_VALIDATED_RESOURCES
        } )

        expect( categories['supportsMcpApps'] ).toBe( true )
        expect( categories['hasUiResources'] ).toBe( true )
        expect( categories['hasUiToolLinkage'] ).toBe( true )
        expect( categories['hasValidUiHtml'] ).toBe( true )
        expect( categories['hasValidCsp'] ).toBe( true )
        expect( categories['supportsTheming'] ).toBe( true )
        expect( categories['supportsDisplayModes'] ).toBe( true )
        expect( categories['hasToolVisibility'] ).toBe( true )
        expect( categories['hasValidPermissions'] ).toBe( true )
        expect( categories['hasGracefulDegradation'] ).toBe( true )
    } )


    test( 'classifies empty capabilities correctly', () => {
        const { categories } = CapabilityClassifier.classify( {
            capabilities: MOCK_CAPABILITIES,
            uiResources: [],
            uiLinkedTools: [],
            validatedResources: []
        } )

        expect( categories['supportsMcpApps'] ).toBe( false )
        expect( categories['hasUiResources'] ).toBe( false )
        expect( categories['hasUiToolLinkage'] ).toBe( false )
        expect( categories['hasValidUiHtml'] ).toBe( false )
        expect( categories['hasValidCsp'] ).toBe( false )
        expect( categories['supportsTheming'] ).toBe( false )
        expect( categories['supportsDisplayModes'] ).toBe( false )
        expect( categories['hasGracefulDegradation'] ).toBe( false )
    } )


    test( 'detects io.modelcontextprotocol/ui extension', () => {
        const { categories } = CapabilityClassifier.classify( {
            capabilities: MOCK_CAPABILITIES_WITH_UI,
            uiResources: [],
            uiLinkedTools: [],
            validatedResources: []
        } )

        expect( categories['supportsMcpApps'] ).toBe( true )
    } )


    test( 'sets supportsMcpApps false when extension not present', () => {
        const { categories } = CapabilityClassifier.classify( {
            capabilities: MOCK_CAPABILITIES,
            uiResources: [],
            uiLinkedTools: [],
            validatedResources: []
        } )

        expect( categories['supportsMcpApps'] ).toBe( false )
    } )


    test( 'sets hasValidCsp false when no CSP on validated resources', () => {
        const { categories } = CapabilityClassifier.classify( {
            capabilities: MOCK_CAPABILITIES_WITH_UI,
            uiResources: MOCK_UI_RESOURCES,
            uiLinkedTools: MOCK_UI_LINKED_TOOLS,
            validatedResources: MOCK_VALIDATED_RESOURCES_MINIMAL
        } )

        expect( categories['hasValidCsp'] ).toBe( false )
    } )


    test( 'handles null capabilities gracefully', () => {
        const { categories } = CapabilityClassifier.classify( {
            capabilities: null,
            uiResources: [],
            uiLinkedTools: [],
            validatedResources: []
        } )

        expect( categories['supportsMcpApps'] ).toBe( false )
    } )


    test( 'returns 10 category keys', () => {
        const { categories } = CapabilityClassifier.classify( {
            capabilities: MOCK_CAPABILITIES,
            uiResources: [],
            uiLinkedTools: [],
            validatedResources: []
        } )

        expect( Object.keys( categories ).length ).toBe( 10 )
    } )
} )
