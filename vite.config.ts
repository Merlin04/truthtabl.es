import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(),
  // Super janky but it works 
  //@ts-expect-error
  {
    transform(code, id, ssr) {
      return code.replace("const ohm=require('ohm-js');module.exports=", "import ohm from 'ohm-js';export default ");
    }
  }],
  server: {
    host: '0.0.0.0',
    hmr: {
      port: 443,
    }
  }
})