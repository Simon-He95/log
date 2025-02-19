import { createExtension, registerCommand } from '@vscode-use/utils'
import { getLog } from './core'

/**
 * todo:
 * 1. 判断上下文如果在注释代码中，需要自动生成到最后一个注释后
 * 2. 生成的前缀空格还需要改进
 */
export = createExtension(() => [registerCommand('log.log', getLog)])
