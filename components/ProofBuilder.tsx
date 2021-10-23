import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Stack, Box, Heading, Text, Divider, ButtonProps } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import parse from "./parser/parser";
import { getPossibilities, removeEl } from "./parser/proofBuilder";

function BoxButton(props: ButtonProps) {
    const { children, ...otherProps } = props;
    return (
        <Button
            bgColor="transparent"
            py="0.5rem"
            px="1rem"
            border="1px solid"
            borderColor="gray.400"
            borderRadius="1rem"
            fontWeight="inherit"
            fontSize="inherit"
            justifyContent="inherit"
            height="inherit"
            whiteSpace="inherit"
            lineHeight="inherit"
            textAlign="left"
            {...otherProps}
        >
            <Box>
                {children}
            </Box>
        </Button>
    )
}

export default function ProofBuilder(props: {
    isOpen: boolean,
    onClose(): void,
    data: string[]
}) {
    const [steps, setSteps] = useState<(string | [
        string,
        ReturnType<typeof parse> | undefined
    ])[]>([]);
    const [selected, setSelected] = useState<number[]>([]);

    function getStepIncludingPremises(index: number) {
        if(index >= props.data.length - 1) {
            const s = steps[index - props.data.length + 1];
            return Array.isArray(s) ? s[0] : s;
        }
        else {
            return props.data[index];
        }
    }

    const argumentForms = useMemo(() => getPossibilities(selected.map(getStepIncludingPremises)), [selected]);

    console.log(steps);
    console.log(argumentForms);

    const getStepProps = (index: number) => ({
        bgColor: selected.includes(index) ? "blue.100" : "transparent",
        _hover: selected.includes(index) ? {
            bgColor: undefined,
            opacity: 0.8
        } : undefined,
        onClick: () => selected.includes(index) ? setSelected(removeEl(selected, selected.indexOf(index))) : setSelected([...selected, index])
    });

    return (
        <Modal isOpen={props.isOpen} onClose={props.onClose}>
            <ModalOverlay />
            <ModalContent maxW="800px">
                <ModalHeader>
                    Proof builder
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack direction="row" spacing="1rem" sx={{
                        "& > *": {
                            flex: 1
                        }
                    }}>
                        <Stack>
                            <Box>
                                <Text fontSize="0.9rem">Conclusion</Text>
                                <Text fontFamily="monospace" fontSize="1.1rem">{props.data[props.data.length - 1]}</Text>
                            </Box>
                            <Divider />
                            {/* Argument premises */}
                            {props.data.slice(0, -1).map((premise, index) => (
                                <BoxButton {...getStepProps(index)}>
                                    {`${index + 1}. `}
                                    <Text fontFamily="monospace" d="inline-block" ml="0.5rem" fontSize="1rem">{premise}</Text>
                                </BoxButton>
                            ))}
                            <Divider />
                            {/* Added steps */}
                            {steps.length > 0 ? (
                                steps.map((step, index) => (
                                    <BoxButton {...getStepProps(index + props.data.length - 1)}>
                                        {`${index + props.data.length}. `}
                                        <Text fontFamily="monospace" d="inline-block" ml="0.5rem" fontSize="1rem">{step}</Text>
                                    </BoxButton>
                                ))
                            ) : (
                                <Text color="gray.500">Get started by selecting premises to build from</Text>
                            )}
                        </Stack>
                        <Stack>
                            <Heading as="h2" size="md">Argument forms</Heading>
                            {selected.length > 0 ? (
                                argumentForms.map(arg => arg.results.map(res => (
                                    <BoxButton onClick={() => {
                                        setSelected([]);
                                        setSteps([
                                            ...steps,
                                            res
                                        ]);
                                    }}>
                                        <Text fontFamily="monospace" fontSize="1rem">{res}</Text>
                                        <Text fontSize="0.9rem">{arg.arg.name} ({arg.arg.abbreviation})</Text>
                                    </BoxButton>
                                )))
                            ) : (
                                <Text color="gray.500">Nothing's selected yet</Text>
                            )}
                        </Stack>
                    </Stack>
                </ModalBody>
                <ModalFooter>
                    <Button>Copy</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}