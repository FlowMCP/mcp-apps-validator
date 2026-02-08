// --- MCP Server Info ---

const MOCK_SERVER_INFO = {
    serverInfo: {
        name: 'test-mcp-apps-server',
        version: '1.0.0',
        description: 'A test MCP server with UI extension'
    },
    protocolVersion: '2025-03-26',
    instructions: null
}


// --- MCP Capabilities ---

const MOCK_TOOLS = [
    {
        name: 'get_weather',
        description: 'Get weather for a location',
        inputSchema: {
            type: 'object',
            properties: {
                location: { type: 'string' }
            },
            required: [ 'location' ]
        },
        _meta: {
            ui: {
                resourceUri: 'ui://weather-dashboard',
                visibility: [ 'model', 'app' ]
            }
        }
    },
    {
        name: 'refresh_dashboard',
        description: 'Refresh dashboard data',
        inputSchema: { type: 'object' },
        _meta: {
            ui: {
                resourceUri: 'ui://weather-dashboard',
                visibility: [ 'app' ]
            }
        }
    },
    {
        name: 'search_web',
        description: 'Search the web',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string' }
            },
            required: [ 'query' ]
        }
    }
]

const MOCK_TOOLS_NO_UI = [
    {
        name: 'get_weather',
        description: 'Get weather for a location',
        inputSchema: {
            type: 'object',
            properties: {
                location: { type: 'string' }
            },
            required: [ 'location' ]
        }
    }
]

const MOCK_RESOURCES = [
    {
        uri: 'ui://weather-dashboard',
        name: 'Weather Dashboard',
        description: 'Interactive weather visualization',
        mimeType: 'text/html;profile=mcp-app'
    },
    {
        uri: 'resource://docs',
        name: 'Documentation',
        description: 'API documentation'
    }
]

const MOCK_RESOURCES_NO_UI = [
    {
        uri: 'resource://docs',
        name: 'Documentation',
        description: 'API documentation'
    }
]

const MOCK_PROMPTS = [
    {
        name: 'summarize',
        description: 'Summarize text'
    }
]

const MOCK_CAPABILITIES = {
    tools: {},
    resources: {}
}

const MOCK_CAPABILITIES_WITH_UI = {
    tools: {},
    resources: {},
    'io.modelcontextprotocol/ui': { version: '2026-01-26' }
}

const MOCK_CAPABILITIES_WITH_UI_EXPERIMENTAL = {
    tools: {},
    resources: {},
    experimental: {
        'io.modelcontextprotocol/ui': { version: '2025-03-26', mimeTypes: [ 'text/html;profile=mcp-app' ] }
    }
}

const MOCK_CAPABILITIES_WITH_UI_EXPERIMENTAL_NO_VERSION = {
    tools: {},
    resources: {},
    experimental: {
        'io.modelcontextprotocol/ui': { mimeTypes: [ 'text/html;profile=mcp-app' ] }
    }
}


// --- UI Resource Content ---

const MOCK_VALID_HTML = '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1></body></html>'

const MOCK_INVALID_HTML = 'not html at all'

const MOCK_EMPTY_HTML = ''

const MOCK_HTML_WITH_THEME = '<!DOCTYPE html><html><head><title>Themed</title><style>:root { color-scheme: light dark; }</style></head><body><div style="background: var(--color-background-primary)">Themed</div></body></html>'

const MOCK_HTML_WITH_FALLBACK = '<!DOCTYPE html><html><head><title>With Fallback</title></head><body><noscript>This content requires JavaScript</noscript><div id="app">Interactive content</div></body></html>'


// --- UI Resource Read Response ---

const MOCK_UI_RESOURCE_CONTENT = {
    contents: [
        {
            uri: 'ui://weather-dashboard',
            mimeType: 'text/html;profile=mcp-app',
            text: MOCK_VALID_HTML,
            _meta: {
                ui: {
                    csp: {
                        connectDomains: [ 'https://api.openweathermap.org' ],
                        resourceDomains: [ 'https://cdn.jsdelivr.net' ],
                        frameDomains: [],
                        baseUriDomains: []
                    },
                    permissions: {
                        geolocation: {}
                    },
                    prefersBorder: true
                }
            }
        }
    ]
}

const MOCK_UI_RESOURCE_NO_CSP = {
    contents: [
        {
            uri: 'ui://weather-dashboard',
            mimeType: 'text/html;profile=mcp-app',
            text: MOCK_VALID_HTML
        }
    ]
}

const MOCK_UI_RESOURCE_INVALID_HTML = {
    contents: [
        {
            uri: 'ui://weather-dashboard',
            mimeType: 'text/html;profile=mcp-app',
            text: MOCK_INVALID_HTML
        }
    ]
}

const MOCK_UI_RESOURCE_EMPTY = {
    contents: [
        {
            uri: 'ui://weather-dashboard',
            mimeType: 'text/html;profile=mcp-app',
            text: MOCK_EMPTY_HTML
        }
    ]
}

const MOCK_UI_RESOURCE_WITH_WILDCARD_CSP = {
    contents: [
        {
            uri: 'ui://weather-dashboard',
            mimeType: 'text/html;profile=mcp-app',
            text: MOCK_VALID_HTML,
            _meta: {
                ui: {
                    csp: {
                        connectDomains: [ '*' ],
                        resourceDomains: [ 'https://cdn.jsdelivr.net' ]
                    }
                }
            }
        }
    ]
}

const MOCK_UI_RESOURCE_WITH_UNKNOWN_PERMISSION = {
    contents: [
        {
            uri: 'ui://weather-dashboard',
            mimeType: 'text/html;profile=mcp-app',
            text: MOCK_VALID_HTML,
            _meta: {
                ui: {
                    permissions: {
                        geolocation: {},
                        bluetooth: {},
                        usb: {}
                    }
                }
            }
        }
    ]
}


// --- Known Permissions ---

const KNOWN_PERMISSIONS = [ 'camera', 'microphone', 'geolocation', 'clipboardWrite' ]


// --- Known Display Modes ---

const KNOWN_DISPLAY_MODES = [ 'inline', 'fullscreen', 'pip' ]


// --- Expected Category Keys (12) ---

const EXPECTED_CATEGORY_KEYS = [
    'isReachable',
    'supportsMcp',
    'supportsMcpApps',
    'hasUiResources',
    'hasUiToolLinkage',
    'hasValidUiHtml',
    'hasValidCsp',
    'supportsTheming',
    'supportsDisplayModes',
    'hasToolVisibility',
    'hasValidPermissions',
    'hasGracefulDegradation'
]


// --- Expected Entry Keys ---

const EXPECTED_ENTRY_KEYS = [
    'endpoint',
    'serverName',
    'serverVersion',
    'serverDescription',
    'protocolVersion',
    'extensionVersion',
    'capabilities',
    'uiResourceCount',
    'uiResources',
    'uiLinkedToolCount',
    'uiLinkedTools',
    'appOnlyToolCount',
    'cspSummary',
    'permissionsSummary',
    'displayModes',
    'tools',
    'resources',
    'latency',
    'timestamp'
]


// --- Full Valid Categories ---

const FULL_VALID_CATEGORIES = {
    isReachable: true,
    supportsMcp: true,
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


// --- Empty Categories ---

const EMPTY_CATEGORIES = {
    isReachable: false,
    supportsMcp: false,
    supportsMcpApps: false,
    hasUiResources: false,
    hasUiToolLinkage: false,
    hasValidUiHtml: false,
    hasValidCsp: false,
    supportsTheming: false,
    supportsDisplayModes: false,
    hasToolVisibility: false,
    hasValidPermissions: false,
    hasGracefulDegradation: false
}


// --- Mock Latency ---

const MOCK_LATENCY = {
    listResources: 80,
    readResource: 150
}


// --- Test Endpoint ---

const TEST_ENDPOINT = 'https://mcp-apps.example.com/mcp'


export {
    MOCK_SERVER_INFO,
    MOCK_TOOLS,
    MOCK_TOOLS_NO_UI,
    MOCK_RESOURCES,
    MOCK_RESOURCES_NO_UI,
    MOCK_PROMPTS,
    MOCK_CAPABILITIES,
    MOCK_CAPABILITIES_WITH_UI,
    MOCK_CAPABILITIES_WITH_UI_EXPERIMENTAL,
    MOCK_CAPABILITIES_WITH_UI_EXPERIMENTAL_NO_VERSION,
    MOCK_VALID_HTML,
    MOCK_INVALID_HTML,
    MOCK_EMPTY_HTML,
    MOCK_HTML_WITH_THEME,
    MOCK_HTML_WITH_FALLBACK,
    MOCK_UI_RESOURCE_CONTENT,
    MOCK_UI_RESOURCE_NO_CSP,
    MOCK_UI_RESOURCE_INVALID_HTML,
    MOCK_UI_RESOURCE_EMPTY,
    MOCK_UI_RESOURCE_WITH_WILDCARD_CSP,
    MOCK_UI_RESOURCE_WITH_UNKNOWN_PERMISSION,
    KNOWN_PERMISSIONS,
    KNOWN_DISPLAY_MODES,
    EXPECTED_CATEGORY_KEYS,
    EXPECTED_ENTRY_KEYS,
    FULL_VALID_CATEGORIES,
    EMPTY_CATEGORIES,
    MOCK_LATENCY,
    TEST_ENDPOINT
}
