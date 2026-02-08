import { McpAppsConnector } from './McpAppsConnector.mjs'


const KNOWN_PERMISSIONS = [ 'camera', 'microphone', 'geolocation', 'clipboardWrite' ]

const KNOWN_DISPLAY_MODES = [ 'inline', 'fullscreen', 'pip' ]

const SENSITIVE_PERMISSIONS = [ 'camera', 'microphone' ]


class UiResourceValidator {


    static async validate( { client, uiResources, tools, timeout } ) {
        const messages = []
        const validatedResources = []

        const uiLinkedTools = tools
            .filter( ( tool ) => {
                const meta = tool['_meta']

                if( !meta ) { return false }

                const ui = meta['ui']

                return ui && ui['resourceUri'] !== undefined
            } )
            .map( ( tool ) => {
                const { name } = tool
                const resourceUri = tool['_meta']['ui']['resourceUri']
                const visibility = tool['_meta']['ui']['visibility'] || [ 'model', 'app' ]

                return { name, resourceUri, visibility }
            } )

        await UiResourceValidator.#processResources( { client, uiResources, messages, validatedResources } )

        UiResourceValidator.#validateToolLinkage( { uiLinkedTools, uiResources, messages } )
        UiResourceValidator.#validateToolUiMeta( { tools, messages } )

        return { messages, validatedResources }
    }


    static async #processResources( { client, uiResources, messages, validatedResources } ) {
        const resourcePromises = uiResources
            .map( async ( resource ) => {
                const uri = resource['uri']

                const { status, content, mimeType, meta } = await McpAppsConnector.readUiResource( { client, uri } )

                if( !status ) {
                    messages.push( `UIR-001 resources/read ${uri}: Resource read failed` )

                    return
                }

                if( mimeType !== 'text/html;profile=mcp-app' && mimeType !== 'text/html' ) {
                    messages.push( `UIR-002 resources/read ${uri}: Expected text/html content, got "${mimeType}"` )

                    return
                }

                const uiMeta = meta?.['ui'] || null

                const validated = {
                    uri,
                    name: resource['name'],
                    mimeType,
                    hasCsp: false,
                    hasPermissions: false,
                    displayModes: [],
                    hasTheming: false,
                    hasGracefulDegradation: false
                }

                UiResourceValidator.#validateHtmlContent( { uri, content, messages } )
                UiResourceValidator.#validateCsp( { uri, uiMeta, messages, validated } )
                UiResourceValidator.#validatePermissions( { uri, uiMeta, messages, validated } )
                UiResourceValidator.#validateDisplayMode( { uri, uiMeta, messages, validated } )
                UiResourceValidator.#validateThemeSupport( { uri, content, messages, validated } )
                UiResourceValidator.#validateGracefulDegradation( { uri, content, messages, validated } )

                validatedResources.push( validated )
            } )

        await Promise.all( resourcePromises )
    }


    static #validateHtmlContent( { uri, content, messages } ) {
        if( content === null || content === undefined ) {
            messages.push( `UIV-010 ${uri}: HTML content is missing` )

            return
        }

        if( typeof content !== 'string' ) {
            messages.push( `UIV-011 ${uri}: HTML content is not a string` )

            return
        }

        if( content.trim() === '' ) {
            messages.push( `UIV-012 ${uri}: HTML content is empty` )

            return
        }

        const lowerContent = content.toLowerCase()
        const hasDoctype = lowerContent.includes( '<!doctype html>' )
        const hasHtmlTag = lowerContent.includes( '<html' )
        const hasBodyTag = lowerContent.includes( '<body' )

        if( !hasDoctype && !hasHtmlTag && !hasBodyTag ) {
            messages.push( `UIV-013 ${uri}: HTML content appears invalid (missing doctype, html, or body tag)` )
        }
    }


    static #validateCsp( { uri, uiMeta, messages, validated } ) {
        if( !uiMeta || !uiMeta['csp'] ) {
            messages.push( `UIV-020 ${uri}: No CSP configuration declared` )

            return
        }

        validated['hasCsp'] = true

        const csp = uiMeta['csp']
        const connectDomains = csp['connectDomains'] || []
        const resourceDomains = csp['resourceDomains'] || []
        const frameDomains = csp['frameDomains'] || []

        const allDomains = [ ...connectDomains, ...resourceDomains, ...frameDomains ]

        allDomains
            .forEach( ( domain ) => {
                if( !domain.startsWith( 'https://' ) && !domain.startsWith( 'wss://' ) && domain !== 'self' ) {
                    messages.push( `UIV-021 ${uri}: CSP domain "${domain}" should use https:// or wss://` )
                }
            } )

        const hasWildcard = allDomains
            .some( ( domain ) => domain === '*' || domain === 'https://*' )

        if( hasWildcard ) {
            messages.push( `UIV-022 ${uri}: CSP contains wildcard domain — allows unrestricted access` )
        }
    }


    static #validatePermissions( { uri, uiMeta, messages, validated } ) {
        if( !uiMeta || !uiMeta['permissions'] ) {
            return
        }

        validated['hasPermissions'] = true

        const permissions = uiMeta['permissions']
        const declaredKeys = Object.keys( permissions )

        const unknownPermissions = declaredKeys
            .filter( ( key ) => !KNOWN_PERMISSIONS.includes( key ) )

        if( unknownPermissions.length > 0 ) {
            messages.push( `UIV-030 ${uri}: Unknown permissions declared: ${unknownPermissions.join( ', ' )}` )
        }

        const sensitiveUsed = declaredKeys
            .filter( ( key ) => SENSITIVE_PERMISSIONS.includes( key ) )

        if( sensitiveUsed.length > 0 ) {
            messages.push( `UIV-031 ${uri}: Sensitive permissions requested: ${sensitiveUsed.join( ', ' )}` )
        }
    }


    static #validateDisplayMode( { uri, uiMeta, messages, validated } ) {
        if( !uiMeta || !uiMeta['displayModes'] ) {
            messages.push( `UIV-041 ${uri}: No display modes declared` )

            return
        }

        const displayModes = uiMeta['displayModes']

        if( !Array.isArray( displayModes ) || displayModes.length === 0 ) {
            messages.push( `UIV-041 ${uri}: No display modes declared` )

            return
        }

        validated['displayModes'] = displayModes

        const unknownModes = displayModes
            .filter( ( mode ) => !KNOWN_DISPLAY_MODES.includes( mode ) )

        if( unknownModes.length > 0 ) {
            messages.push( `UIV-040 ${uri}: Unknown display modes: ${unknownModes.join( ', ' )}` )
        }
    }


    static #validateThemeSupport( { uri, content, messages, validated } ) {
        if( !content || typeof content !== 'string' ) {
            return
        }

        const lowerContent = content.toLowerCase()
        const hasColorScheme = lowerContent.includes( 'color-scheme' )
        const hasCssVariables = content.includes( 'var(--' )
        const hasLightDark = lowerContent.includes( 'light-dark(' )
        const hasDataTheme = lowerContent.includes( 'data-theme' )

        const acknowledged = hasColorScheme || hasCssVariables || hasLightDark || hasDataTheme

        if( acknowledged ) {
            validated['hasTheming'] = true
        } else {
            messages.push( `UIV-050 ${uri}: No theming acknowledgment found (no color-scheme, CSS variables, or data-theme)` )
        }
    }


    static #validateGracefulDegradation( { uri, content, messages, validated } ) {
        if( !content || typeof content !== 'string' ) {
            return
        }

        const lowerContent = content.toLowerCase()
        const hasNoscript = lowerContent.includes( '<noscript' )
        const hasTextContent = lowerContent.includes( 'noscript' ) || lowerContent.includes( 'fallback' )

        if( hasNoscript || hasTextContent ) {
            validated['hasGracefulDegradation'] = true
        } else {
            messages.push( `UIV-070 ${uri}: No graceful degradation found (no <noscript> or text fallback)` )
        }
    }


    static #validateToolLinkage( { uiLinkedTools, uiResources, messages } ) {
        if( uiLinkedTools.length === 0 ) {
            messages.push( 'UIV-062 tools: No tools linked to UI resources' )

            return
        }

        const uiUris = uiResources
            .map( ( r ) => r['uri'] )

        uiLinkedTools
            .forEach( ( tool ) => {
                const { name, resourceUri, visibility } = tool

                if( !uiUris.includes( resourceUri ) ) {
                    messages.push( `UIV-060 tool ${name}: References non-existent UI resource "${resourceUri}"` )
                }

                if( visibility && Array.isArray( visibility ) ) {
                    const invalidVisibility = visibility
                        .filter( ( v ) => v !== 'model' && v !== 'app' )

                    if( invalidVisibility.length > 0 ) {
                        messages.push( `UIV-061 tool ${name}: Invalid visibility values: ${invalidVisibility.join( ', ' )}` )
                    }
                }
            } )
    }


    static #validateToolUiMeta( { tools, messages } ) {
        tools
            .forEach( ( tool ) => {
                const { name } = tool
                const meta = tool['_meta']

                if( !meta ) { return }

                const ui = meta['ui']

                if( !ui ) { return }

                if( ui['resourceUri'] === undefined || ui['resourceUri'] === null ) {
                    messages.push( `UIV-063 ${name}: Has UI metadata but no resourceUri` )
                }
            } )
    }
}


export { UiResourceValidator }
