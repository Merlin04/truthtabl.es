import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from "@chakra-ui/react"

const theme = extendTheme({
  colors: {
    // Cultured
    white: "#f9f9f9ff",
    primary: {
      // Space cadet
      600: "#20255aff",
      // Blue pigment
      500: "#333b8eff",
      // Glaucous
      400: "#6883baff"
    },
    secondary: {
      // Xanadu
      500: "#757761ff",
      // Russian green
      400: "#6e9075ff"
    }
  }/*,
  styles: {
    global: {
      // styles for the `body`
      body: {
        bg: "primary.600",
        color: "white"
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        color: "black"
        //bg: "primary.400"
      }
    }
  }*/
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
export default MyApp
