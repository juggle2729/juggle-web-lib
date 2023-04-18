import MessageConstructor from "./src/main.vue";
import { createVNode, render } from 'vue';

export const MessageAspopBrowser = function (options = {}) {
    const vm = createVNode(
        MessageConstructor,
        options,
    )
    const id = 'MessagePop'
    const container = document.createElement('div')
    container.className = `container_${id}`

    vm.props.onDestroy = () => {
        render(null, container)
    }

    render(vm, container)
    document.body.appendChild(container)
};

export default {
    install(app) {
        app.config.globalProperties.$messageAspopBrowser = MessageAspopBrowser
    }
}
