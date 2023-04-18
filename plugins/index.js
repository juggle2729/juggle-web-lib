import { importAndCreatePlugin } from '../utils/imps.js';

export default importAndCreatePlugin(require.context('./', false, /\.js$/));
