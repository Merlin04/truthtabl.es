import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import { createBreakpoints } from '@chakra-ui/theme-tools';

const breakpoints = createBreakpoints({
  // Copied from https://github.com/chakra-ui/chakra-ui/blob/main/packages/theme/src/foundations/breakpoints.ts
  sm: "30em",
  md: "48em",
  lg: "62em",
  xl: "80em",
  "2xl": "96em",
  calculator: "66em"
});

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
  },
  breakpoints/*,
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
