/**
 * Accept the shaders and WebGL context and perform the steps required to create a <code>WebGLProgram</code>
 *
 * @param {WebGLRenderingContext | WebGL2RenderingContext} webGlContext
 * @param {string} vertexShaderText
 * @param {string} fragmentShaderText
 * @param {boolean} verify
 * @throws Error containing further details of error.
 * @returns {WebGLProgram} Compiled WebGL program.
 */
export function createProgram(
    webGlContext: WebGLRenderingContext | WebGL2RenderingContext,
    vertexShaderText: string,
    fragmentShaderText: string,
    verify: boolean = true
) {
    if (!webGlContext) {
        console.error("This browser doesn't support WebGL");
    }

    webGlContext.clearColor(0.0, 0.0, 0.0, 0.0);
    webGlContext.clear(
        webGlContext.COLOR_BUFFER_BIT | webGlContext.DEPTH_BUFFER_BIT
    );

    const vertexShader = webGlContext.createShader(webGlContext.VERTEX_SHADER);
    const fragmentShader = webGlContext.createShader(
        webGlContext.FRAGMENT_SHADER
    );

    if(!vertexShader || !fragmentShader)
      throw new Error('Failed to create webgl shaders.')

    webGlContext.shaderSource(vertexShader, vertexShaderText);
    webGlContext.shaderSource(fragmentShader, '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragmentShaderText);

    webGlContext.compileShader(vertexShader);
    webGlContext.compileShader(fragmentShader);

    const compileStatus = {
        vertexStatus:
            webGlContext.getShaderParameter(
                vertexShader,
                webGlContext.COMPILE_STATUS
            ) || webGlContext.getShaderInfoLog(vertexShader),
        fragmentStatus:
            webGlContext.getShaderParameter(
                fragmentShader,
                webGlContext.COMPILE_STATUS
            ) || webGlContext.getShaderInfoLog(fragmentShader),
    };

    if (
        compileStatus.vertexStatus !== true ||
        compileStatus.fragmentStatus !== true
    ) {
        throw new Error(
            `Failed to compile. ${JSON.stringify(compileStatus, null, 2)}`
        );
    }

    const program = webGlContext.createProgram();

    webGlContext.attachShader(program, vertexShader);
    webGlContext.attachShader(program, fragmentShader);
    webGlContext.linkProgram(program);

    const linkingStatus =
        webGlContext.getProgramParameter(program, webGlContext.LINK_STATUS) ||
        webGlContext.getProgramInfoLog(program);

    if (linkingStatus !== true) {
        throw new Error(`Linking filed:\n${linkingStatus}`);
    }

    if (verify) {
        webGlContext.validateProgram(program);
        const validationStatus =
            webGlContext.getProgramParameter(
                program,
                webGlContext.VALIDATE_STATUS
            ) || webGlContext.getProgramInfoLog(program);

        if (validationStatus !== true) {
            throw new Error(`Validation failed.\n${validationStatus}`);
        }
    }
    return program;
}