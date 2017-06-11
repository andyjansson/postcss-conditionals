import {plugin} from 'postcss';

import process from './lib/process';

export default plugin('postcss-conditionals', () => {
    return process;
});