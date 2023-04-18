import main from './src/main'

main.install = function (Vue) {
  Vue.component(main.name, main)
}

export default main
