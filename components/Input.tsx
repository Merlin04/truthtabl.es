import React from "react";
import { parse, ParseResult } from "./parser/parser";
import { Input as ChakraInput, Text, Button } from "@chakra-ui/react";

function prettify(input: string) {
    return input.replaceAll(">", "⊃").replaceAll("=", "≡");
}

export default function Input({ result, onChange: setResult, input, onInputChange: setInput }: {
    result: ParseResult | undefined,
    onChange(result: ParseResult | undefined): void,
    input: string,
    onInputChange(input: string): void
}) {
    React.useEffect(() => setResult(input.trim().length === 0 ? undefined : parse(input)), [input]);
    
    return (
        <>
            <ChakraInput variant="flushed" value={input} onChange={(e) => setInput(e.target.value)} fontFamily="monospace" placeholder="Enter statement here" />
            {input.length > 0 && result && (
                result.success ? (
                    <>
                        <Text mt="0.5rem" display="inline-block" mr="0.5rem">👍</Text>
                    </>
                ) : (
                    <Text as="pre" color="red.500">{result.match.message.split("\n").filter((_, i) => i > 1).join("\n").slice(6)}</Text>
                )
            )}
            <Button mt={result?.success ? undefined : "0.5rem"} size="xs" onClick={() => setInput(prettify(input))}>Prettify</Button>
        </>
    )
}