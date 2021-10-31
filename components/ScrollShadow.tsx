import { Box, BoxProps } from "@chakra-ui/react";

if(typeof window !== "undefined") {
    import("../node_modules/scroll-shadow-element/scroll-shadow-element");
}

function ScrollShadowComponentWrapper(props: {
    className: string,
    children: React.ReactNode
}) {
    return (
        //@ts-expect-error - TypeScript doesn't know about the custom element
        <scroll-shadow class={props.className}>{props.children}</scroll-shadow>
    );
}

export default function ScrollShadow(props: BoxProps) {
    const { children, ...otherProps } = props;

    return (
        <Box as={ScrollShadowComponentWrapper} {...otherProps}>
            <Box overflow="auto">
                {children}
            </Box>
        </Box>
    )
}
