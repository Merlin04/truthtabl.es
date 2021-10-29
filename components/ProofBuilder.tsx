import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Stack, Box, Heading, Text, Divider, ButtonProps, BoxProps, CloseButton } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import parse from "./parser/parser";
import { getPossibilities, getReplacementPossibilities, PLACEHOLDER_TOKEN, removeEl } from "./parser/proofBuilder";

function BoxButton(props: ButtonProps & {
    boxProps?: BoxProps
}) {
    const { children, boxProps, ...otherProps } = props;
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
            <Box {...boxProps}>
                {children}
            </Box>
        </Button>
    )
}

type Step = {
    statement: (string | [string, ReturnType<typeof parse> | undefined])[],
    source: number[],
    argType: string
};

function d<T>(arg: T): T {
    console.log(arg);
    return arg;
}

export default function ProofBuilder(props: {
    isOpen: boolean,
    onClose(): void,
    data: string[]
}) {
    const [steps, setSteps] = useState<Step[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [highlighted, setHighlighted] = useState<number[]>([]);

    function getStepIncludingPremises(index: number) {
        if(index >= props.data.length - 1) {
            return steps[index - props.data.length + 1].statement.reduce<string>((acc, cur) => acc + (Array.isArray(cur) ? cur[0] : cur), "");
        }
        else {
            return props.data[index];
        }
    }

    const argumentForms = useMemo(() => getPossibilities(selected.map(getStepIncludingPremises)), [selected]);
    const replacementForms = useMemo(() => selected.length === 1 ? getReplacementPossibilities(getStepIncludingPremises(selected[0])) : [], [selected]);

    const getStepProps = (index: number) => ({
        bgColor: selected.includes(index) ? "blue.100" : (highlighted.includes(index) ? "#d6f1ff" : "transparent"),
        _hover: selected.includes(index) ? {
            bgColor: undefined,
            opacity: 0.8
        } : undefined,
        onClick: () => selected.includes(index) ? setSelected(removeEl(selected, selected.indexOf(index))) : setSelected([...selected, index])
    });console.log(steps);

    const ArgFormButton = ({ res, arg }: { res: string, arg: {
        arg: {
            name: string;
            abbreviation: string;
        }
    }}) => (
        <BoxButton boxProps={{
            display: "flex",
            alignItems: "baseline",
            width: "100%"
        }} onClick={() => {
            setSelected([]);
            setSteps([
                ...steps,
                {
                    statement: res.split(PLACEHOLDER_TOKEN).reduce<Step["statement"]>((acc, cur, index) => index !== 0 ? [...acc, ["", undefined], cur] : [...acc, cur], []),
                    source: selected,
                    argType: arg.arg.abbreviation
                }
            ]);
        }}>
            <Text flex="1" fontFamily="monospace" fontSize="1rem">{res}</Text>
            <Text fontSize="0.9rem">{arg.arg.name} ({arg.arg.abbreviation})</Text>
        </BoxButton>
    );

    const success = useMemo(() => steps.some(s => s.statement[0] as string /* TODO */ === props.data[props.data.length - 1]), [steps]);

    console.log("Steps");console.log(steps);console.log("p.d");console.log(props.data);

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
                                <Stack direction="row" alignItems="baseline" backgroundColor={success ? "green.100" : "red.100"} borderRadius="1rem" px="1rem" py="0.5rem">
                                    <Text fontFamily="monospace" fontSize="1.1rem">{props.data[props.data.length - 1]}</Text>
                                    {success ? (
                                        <Text>👍</Text>
                                    ) : (
                                        <Text>👎</Text>
                                    )}
                                </Stack>
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
                                    <BoxButton {...getStepProps(index + props.data.length - 1)} onMouseOver={() => {
                                        setHighlighted(step.source);
                                    }} onMouseOut={() => {
                                        setHighlighted([]);
                                    }}  boxProps={{
                                        display: "flex",
                                        alignItems: "baseline",
                                        width: "100%"
                                    }}>
                                        {`${index + props.data.length}. `}
                                        <Text flex="1" fontFamily="monospace" d="inline-block" ml="0.5rem" fontSize="1rem">{step.statement /* TODO */}</Text>
                                        <Text color="gray.500">{step.source.map(s => s + 1).join(", ")} {step.argType}</Text>
                                        {steps.every(s => !s.source.includes(index + props.data.length - 1)) && (
                                            <CloseButton size="sm" ml="0.25rem" onClick={(e) => {
                                                e.stopPropagation();
                                                setSelected(selected.filter(s => s !== index + props.data.length - 1));
                                                setHighlighted([]);
                                                setSteps(removeEl(steps, index).map(v => ({
                                                    ...v,
                                                    // You shouldn't be able to click close if the index is contained in any of the source arrays, so no need for >=
                                                    source: v.source.map(s => s > (index + props.data.length - 1) ? s - 1 : s)
                                                })));
                                            }} />
                                        )}
                                    </BoxButton>
                                ))
                            ) : (
                                <Text color="gray.500">Get started by selecting premises to build from</Text>
                            )}
                        </Stack>
                        <Stack>
                            <Heading as="h2" size="md">Argument forms</Heading>
                            {selected.length > 0 ? (
                                <>
                                    {argumentForms.length > 0 ? argumentForms.map(arg => arg.results.map(res => (
                                        <ArgFormButton res={res} arg={arg} />
                                    ))) : (
                                        <Text color="gray.500">No matching argument forms found</Text>
                                    )}
                                    <Heading as="h2" size="md" pt="1rem">Replacement rules</Heading>
                                    {selected.length !== 1 ? (
                                        <Text color="gray.500">Multiple items are selected</Text>
                                    ) : replacementForms.length > 0 ? replacementForms.map(rule => rule.results.map(res => (
                                        <ArgFormButton res={res} arg={rule} />
                                    ))) : (
                                        <Text color="gray.500">No matching replacement rules found</Text>
                                    )}
                                </>
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