import { jest, describe, test, expect, beforeEach } from '@jest/globals'

import { McpAppsConnector } from '../../../src/task/McpAppsConnector.mjs'

import {
    MOCK_TOOLS,
    MOCK_TOOLS_NO_UI,
    MOCK_RESOURCES,
    MOCK_RESOURCES_NO_UI,
    MOCK_UI_RESOURCE_CONTENT,
    MOCK_VALID_HTML
} from '../../helpers/config.mjs'


describe( 'McpAppsConnector', () => {

    describe( 'discoverUiResources', () => {

        test( 'extracts ui:// resources from resource list', () => {
            const { uiResources } = McpAppsConnector.discoverUiResources( {
                resources: MOCK_RESOURCES,
                tools: MOCK_TOOLS
            } )

            expect( uiResources ).toHaveLength( 1 )
            expect( uiResources[0]['uri'] ).toBe( 'ui://weather-dashboard' )
            expect( uiResources[0]['name'] ).toBe( 'Weather Dashboard' )
            expect( uiResources[0]['mimeType'] ).toBe( 'text/html;profile=mcp-app' )
        } )


        test( 'returns empty when no ui:// resources exist', () => {
            const { uiResources } = McpAppsConnector.discoverUiResources( {
                resources: MOCK_RESOURCES_NO_UI,
                tools: MOCK_TOOLS_NO_UI
            } )

            expect( uiResources ).toHaveLength( 0 )
        } )


        test( 'extracts ui-linked tools with _meta.ui.resourceUri', () => {
            const { uiLinkedTools } = McpAppsConnector.discoverUiResources( {
                resources: MOCK_RESOURCES,
                tools: MOCK_TOOLS
            } )

            expect( uiLinkedTools ).toHaveLength( 2 )
            expect( uiLinkedTools[0]['name'] ).toBe( 'get_weather' )
            expect( uiLinkedTools[0]['resourceUri'] ).toBe( 'ui://weather-dashboard' )
            expect( uiLinkedTools[0]['visibility'] ).toEqual( [ 'model', 'app' ] )
        } )


        test( 'detects app-only tools with visibility ["app"]', () => {
            const { uiLinkedTools } = McpAppsConnector.discoverUiResources( {
                resources: MOCK_RESOURCES,
                tools: MOCK_TOOLS
            } )

            const appOnlyTool = uiLinkedTools
                .find( ( t ) => t['name'] === 'refresh_dashboard' )

            expect( appOnlyTool ).toBeDefined()
            expect( appOnlyTool['visibility'] ).toEqual( [ 'app' ] )
        } )


        test( 'returns empty ui-linked tools when no tools have _meta.ui', () => {
            const { uiLinkedTools } = McpAppsConnector.discoverUiResources( {
                resources: MOCK_RESOURCES_NO_UI,
                tools: MOCK_TOOLS_NO_UI
            } )

            expect( uiLinkedTools ).toHaveLength( 0 )
        } )


        test( 'defaults visibility to ["model", "app"] when not specified', () => {
            const toolsWithoutVisibility = [
                {
                    name: 'test_tool',
                    description: 'Test',
                    _meta: {
                        ui: {
                            resourceUri: 'ui://test'
                        }
                    }
                }
            ]

            const { uiLinkedTools } = McpAppsConnector.discoverUiResources( {
                resources: [],
                tools: toolsWithoutVisibility
            } )

            expect( uiLinkedTools[0]['visibility'] ).toEqual( [ 'model', 'app' ] )
        } )
    } )


    describe( 'readUiResource', () => {

        test( 'returns content from successful read', async () => {
            const mockClient = {
                readResource: jest.fn().mockResolvedValue( MOCK_UI_RESOURCE_CONTENT )
            }

            const { status, content, mimeType, meta } = await McpAppsConnector.readUiResource( {
                client: mockClient,
                uri: 'ui://weather-dashboard'
            } )

            expect( status ).toBe( true )
            expect( content ).toBe( MOCK_VALID_HTML )
            expect( mimeType ).toBe( 'text/html;profile=mcp-app' )
            expect( meta ).toBeDefined()
            expect( meta['ui']['csp']['connectDomains'] ).toContain( 'https://api.openweathermap.org' )
        } )


        test( 'returns false status when read fails', async () => {
            const mockClient = {
                readResource: jest.fn().mockRejectedValue( new Error( 'Not found' ) )
            }

            const { status, content, mimeType } = await McpAppsConnector.readUiResource( {
                client: mockClient,
                uri: 'ui://nonexistent'
            } )

            expect( status ).toBe( false )
            expect( content ).toBeNull()
            expect( mimeType ).toBeNull()
        } )


        test( 'returns false status when contents array is empty', async () => {
            const mockClient = {
                readResource: jest.fn().mockResolvedValue( { contents: [] } )
            }

            const { status } = await McpAppsConnector.readUiResource( {
                client: mockClient,
                uri: 'ui://empty'
            } )

            expect( status ).toBe( false )
        } )
    } )


    describe( 'measureLatency', () => {

        test( 'measures listResources and readResource latency', async () => {
            const mockClient = {
                listResources: jest.fn().mockResolvedValue( { resources: MOCK_RESOURCES } ),
                readResource: jest.fn().mockResolvedValue( MOCK_UI_RESOURCE_CONTENT )
            }

            const uiResources = [ { uri: 'ui://weather-dashboard' } ]

            const { latency } = await McpAppsConnector.measureLatency( {
                client: mockClient,
                uiResources
            } )

            expect( typeof latency['listResources'] ).toBe( 'number' )
            expect( typeof latency['readResource'] ).toBe( 'number' )
        } )


        test( 'returns null readResource when no ui resources', async () => {
            const mockClient = {
                listResources: jest.fn().mockResolvedValue( { resources: [] } )
            }

            const { latency } = await McpAppsConnector.measureLatency( {
                client: mockClient,
                uiResources: []
            } )

            expect( typeof latency['listResources'] ).toBe( 'number' )
            expect( latency['readResource'] ).toBeNull()
        } )


        test( 'returns null on measurement failure', async () => {
            const mockClient = {
                listResources: jest.fn().mockRejectedValue( new Error( 'fail' ) ),
                readResource: jest.fn().mockRejectedValue( new Error( 'fail' ) )
            }

            const { latency } = await McpAppsConnector.measureLatency( {
                client: mockClient,
                uiResources: [ { uri: 'ui://test' } ]
            } )

            expect( latency['listResources'] ).toBeNull()
            expect( latency['readResource'] ).toBeNull()
        } )
    } )


    describe( 'disconnect', () => {

        test( 'returns disconnected true with null client', async () => {
            const { disconnected } = await McpAppsConnector.disconnect( { client: null } )

            expect( disconnected ).toBe( true )
        } )


        test( 'calls close on client', async () => {
            const mockClient = {
                close: jest.fn().mockResolvedValue( undefined )
            }

            const { disconnected } = await McpAppsConnector.disconnect( { client: mockClient } )

            expect( disconnected ).toBe( true )
            expect( mockClient['close'] ).toHaveBeenCalledTimes( 1 )
        } )


        test( 'handles close error gracefully', async () => {
            const mockClient = {
                close: jest.fn().mockRejectedValue( new Error( 'fail' ) )
            }

            const { disconnected } = await McpAppsConnector.disconnect( { client: mockClient } )

            expect( disconnected ).toBe( true )
        } )
    } )
} )
