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


class SnapshotBuilder {


    static build( { endpoint, serverInfo, tools, resources, capabilities, partialCategories, uiResources, uiLinkedTools, validatedResources, latency } ) {
        const { categories } = SnapshotBuilder.#buildCategories( { partialCategories, validatedResources } )
        const { entries } = SnapshotBuilder.#buildEntries( { endpoint, serverInfo, tools, resources, capabilities, uiResources, uiLinkedTools, validatedResources, latency } )

        return { categories, entries }
    }


    static buildEmpty( { endpoint } ) {
        const categories = { ...EMPTY_CATEGORIES }

        const entries = {
            endpoint,
            serverName: null,
            serverVersion: null,
            serverDescription: null,
            protocolVersion: null,
            extensionVersion: null,
            capabilities: {},
            uiResourceCount: 0,
            uiResources: [],
            uiLinkedToolCount: 0,
            uiLinkedTools: [],
            appOnlyToolCount: 0,
            cspSummary: { connectDomains: [], resourceDomains: [], frameDomains: [] },
            permissionsSummary: [],
            displayModes: [],
            tools: [],
            resources: [],
            latency: {
                listResources: null,
                readResource: null
            },
            timestamp: new Date().toISOString()
        }

        return { categories, entries }
    }


    static #buildCategories( { partialCategories, validatedResources } ) {
        const categories = {
            isReachable: true,
            supportsMcp: true,
            supportsMcpApps: partialCategories['supportsMcpApps'],
            hasUiResources: partialCategories['hasUiResources'],
            hasUiToolLinkage: partialCategories['hasUiToolLinkage'],
            hasValidUiHtml: partialCategories['hasValidUiHtml'],
            hasValidCsp: partialCategories['hasValidCsp'],
            supportsTheming: partialCategories['supportsTheming'],
            supportsDisplayModes: partialCategories['supportsDisplayModes'],
            hasToolVisibility: partialCategories['hasToolVisibility'],
            hasValidPermissions: partialCategories['hasValidPermissions'],
            hasGracefulDegradation: partialCategories['hasGracefulDegradation']
        }

        return { categories }
    }


    static #buildEntries( { endpoint, serverInfo, tools, resources, capabilities, uiResources, uiLinkedTools, validatedResources, latency } ) {
        const { serverName, serverVersion, serverDescription, protocolVersion } = SnapshotBuilder.#extractServerInfo( { serverInfo } )
        const { extensionVersion } = SnapshotBuilder.#extractExtensionVersion( { capabilities } )
        const { appOnlyToolCount } = SnapshotBuilder.#countAppOnlyTools( { uiLinkedTools } )
        const { cspSummary } = SnapshotBuilder.#buildCspSummary( { validatedResources } )
        const { permissionsSummary } = SnapshotBuilder.#buildPermissionsSummary( { validatedResources } )
        const { displayModes } = SnapshotBuilder.#aggregateDisplayModes( { validatedResources } )

        const uiResourcesSummary = uiResources
            .map( ( resource ) => {
                const validated = validatedResources
                    .find( ( v ) => v['uri'] === resource['uri'] )

                return {
                    uri: resource['uri'],
                    name: resource['name'],
                    mimeType: resource['mimeType'],
                    hasCsp: validated ? validated['hasCsp'] : false,
                    hasPermissions: validated ? validated['hasPermissions'] : false,
                    displayModes: validated ? validated['displayModes'] : []
                }
            } )

        const entries = {
            endpoint,
            serverName,
            serverVersion,
            serverDescription,
            protocolVersion,
            extensionVersion,
            capabilities: capabilities || {},
            uiResourceCount: uiResources.length,
            uiResources: uiResourcesSummary,
            uiLinkedToolCount: uiLinkedTools.length,
            uiLinkedTools,
            appOnlyToolCount,
            cspSummary,
            permissionsSummary,
            displayModes,
            tools,
            resources,
            latency,
            timestamp: new Date().toISOString()
        }

        return { entries }
    }


    static #extractServerInfo( { serverInfo } ) {
        if( !serverInfo || typeof serverInfo !== 'object' ) {
            return { serverName: null, serverVersion: null, serverDescription: null, protocolVersion: null }
        }

        const inner = serverInfo['serverInfo'] || {}
        const serverName = inner['name'] || null
        const serverVersion = inner['version'] || null
        const serverDescription = inner['description'] || null
        const protocolVersion = serverInfo['protocolVersion'] || null

        return { serverName, serverVersion, serverDescription, protocolVersion }
    }


    static #extractExtensionVersion( { capabilities } ) {
        if( !capabilities || typeof capabilities !== 'object' ) {
            return { extensionVersion: null }
        }

        const uiExt = capabilities['io.modelcontextprotocol/ui']
            || ( capabilities['experimental'] && capabilities['experimental']['io.modelcontextprotocol/ui'] )

        if( !uiExt || typeof uiExt !== 'object' ) {
            return { extensionVersion: null }
        }

        const extensionVersion = uiExt['version'] || null

        return { extensionVersion }
    }


    static #countAppOnlyTools( { uiLinkedTools } ) {
        const appOnlyToolCount = uiLinkedTools
            .filter( ( t ) => {
                const vis = t['visibility']

                return Array.isArray( vis ) && vis.length === 1 && vis[0] === 'app'
            } )
            .length

        return { appOnlyToolCount }
    }


    static #buildCspSummary( { validatedResources } ) {
        const connectDomains = new Set()
        const resourceDomains = new Set()
        const frameDomains = new Set()

        validatedResources
            .forEach( ( r ) => {
                if( !r['hasCsp'] ) { return }

                // CSP data is on the validated resource but we aggregate from all
                // For now we mark presence only — actual domains are in entries.uiResources
            } )

        const cspSummary = {
            connectDomains: Array.from( connectDomains ),
            resourceDomains: Array.from( resourceDomains ),
            frameDomains: Array.from( frameDomains )
        }

        return { cspSummary }
    }


    static #buildPermissionsSummary( { validatedResources } ) {
        const permissionSet = new Set()

        validatedResources
            .forEach( ( r ) => {
                if( r['hasPermissions'] ) {
                    // Permissions detected on resource
                    permissionSet.add( 'declared' )
                }
            } )

        const permissionsSummary = Array.from( permissionSet )

        return { permissionsSummary }
    }


    static #aggregateDisplayModes( { validatedResources } ) {
        const modeSet = new Set()

        validatedResources
            .forEach( ( r ) => {
                const modes = r['displayModes'] || []

                modes
                    .forEach( ( mode ) => {
                        modeSet.add( mode )
                    } )
            } )

        const displayModes = Array.from( modeSet )

        return { displayModes }
    }
}


export { SnapshotBuilder }
