import { importAndCreatePlugin } from '../utils/imps.js';

export default importAndCreatePlugin(require.context('./', true, /\/[\w]+\/index.js$/));
