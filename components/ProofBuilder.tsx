import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Stack, Box, Heading, Text, Divider, ButtonProps, BoxProps, CloseButton } from "@chakra-ui/react";
import React, { createContext, useContext, useMemo, useState } from "react";
import { createSemantics, getPossibilities, getReplacementPossibilities, parseAsNode, removeEl, stringifyNode } from "./parser/proofBuilder";
import grammar from "./parser/SymbolicLogic.ohm-bundle";
import { createState } from "niue";

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
    statement: string,
    source: number[],
    argType: string
};

const StatementTreeSourceContext = createContext(0);

const StatementTreeNode = (props: {
    path: number[]
} & BoxProps) => {
    const { selected } = useStore(["selected"]);
    const source = useContext(StatementTreeSourceContext);
    const { path, ...otherProps } = props;
    const [hovered, setHovered] = useState(false);

    const thisIsSelected = !Array.isArray(selected) && selected.source === source && selected.path.every((val, i) => val === path[i]);
    const bgColor = (hovered || thisIsSelected) ? "blue.100" : undefined;

    return <Box display="inline-block" bgColor={bgColor} sx={{
        "& *": {
            bgColor
        }
    }} onMouseOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        console.log(path);
    }} onMouseOut={(e) => {
        e.stopPropagation();
        setHovered(false);
    }} onClick={(e) => {
        e.stopPropagation();
        setStore({
            selected: thisIsSelected ? [] : {
                source,
                path
            }
        });
    }} {...otherProps}></Box>;
};

const statementTreeSemantics = createSemantics<React.ReactNode>({
    dyadic(arg0, arg1, arg2) {
        return <StatementTreeNode path={this.args.path}>{arg0.eval([...this.args.path, 0])} {arg1.sourceString} {arg2.eval([...this.args.path, 1])}</StatementTreeNode>;
    },
    monadic(arg0, arg1) {
        return <StatementTreeNode path={this.args.path}>{arg0.sourceString}{arg1.eval([...this.args.path, 0])}</StatementTreeNode>;
    },
    identifier(arg0) {
        return <StatementTreeNode path={this.args.path}>{arg0.sourceString}</StatementTreeNode>;
    },
    grouping(arg0, arg1, arg2) {
        return <>{arg0.sourceString}{arg1.eval(this.args.path)}{arg2.sourceString}</>;
    },
    signature: "(path)"
});

function StatementTree(props: {
    statement: string,
    index: number
}) {
    const tree = useMemo(() => statementTreeSemantics(grammar.match(props.statement)).eval([]), [props.statement]);

    return (
        <StatementTreeSourceContext.Provider value={props.index}>
            {tree}
        </StatementTreeSourceContext.Provider>
    );
}

function ArgFormButton({ res, arg }: { res: string, arg: {
    arg: {
        name: string;
        abbreviation: string;
    }
}}) {
    const { steps, selected } = useStore(["steps", "selected"]);

    return (
        <BoxButton boxProps={{
            display: "flex",
            alignItems: "baseline",
            width: "100%"
        }} onClick={() => {
            setStore({
                selected: [],
                steps: [
                    ...steps,
                    {
                        // TODO: handle placeholders
                        statement: res /*.split(PLACEHOLDER_TOKEN).reduce<Step["statement"]>((acc, cur, index) => index !== 0 ? [...acc, ["", undefined], cur] : [...acc, cur], [])*/,
                        source: selected as number[], // TODO: handle fragments
                        argType: arg.arg.abbreviation
                    }
                ]
            });
        }}>
            <Text flex="1" fontFamily="monospace" fontSize="1rem">{res}</Text>
            <Text fontSize="0.9rem">{arg.arg.name} ({arg.arg.abbreviation})</Text>
        </BoxButton>
    );
}

type StepFragment = {
    source: number,
    path: number[]
};

const [useStore, setStore] = createState<{
    steps: Step[],
    selected: number[] | StepFragment,
    highlighted: number[]
}>({
    steps: [],
    selected: [],
    highlighted: []
});

export default function ProofBuilder(props: {
    isOpen: boolean,
    onClose(): void,
    data: string[]
}) {
    const { steps, selected, highlighted } = useStore();

    function getStepIncludingPremises(index: number) {
        if(index >= props.data.length - 1) {
            return steps[index - props.data.length + 1].statement;
        }
        else {
            return props.data[index];
        }
    }

    function getFragment(f: StepFragment) {
        const src = getStepIncludingPremises(f.source);
        // Traverse the node to get to the specified fragment
        return stringifyNode(f.path.reduce((node, cur) => node.children[cur], parseAsNode(src)));
    }

    const argumentForms = useMemo(() => Array.isArray(selected) ? getPossibilities(selected.map(getStepIncludingPremises)) : [], [selected]);
    const replacementForms = useMemo(() =>
        Array.isArray(selected) && selected.length !== 1 ? [] :
        getReplacementPossibilities(
            Array.isArray(selected) ? getStepIncludingPremises(selected[0]) : getFragment(selected)
        )
    , [selected]);

    const getStepProps = (index: number) => ({
        bgColor: Array.isArray(selected) && selected.includes(index) ? "blue.100" : (highlighted.includes(index) ? "#d6f1ff" : "transparent"),
        _hover: Array.isArray(selected) && selected.includes(index) ? {
            bgColor: undefined,
            opacity: 0.8
        } : undefined,
        onClick: () => !Array.isArray(selected)
            ? setStore({ selected: [index] })
            : selected.includes(index)
                ? setStore({ selected: removeEl(selected, selected.indexOf(index)) })
                : setStore({ selected: [...selected, index] })
    });

    const success = useMemo(() => steps.some(s => s.statement === props.data[props.data.length - 1]), [steps]);

    const ReplacementRules = (
        <>
            <Heading as="h2" size="md" pt="1rem">Replacement rules</Heading>
            {Array.isArray(selected) && selected.length !== 1 ? (
                <Text color="gray.500">Multiple items are selected</Text>
            ) : replacementForms.length > 0 ? replacementForms.map(rule => rule.results.map(res => (
                <ArgFormButton res={res} arg={rule} />
            ))) : (
                <Text color="gray.500">No matching replacement rules found</Text>
            )}
        </>
    );

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
                                    <Text fontFamily="monospace" d="inline-block" ml="0.5rem" fontSize="1rem">
                                        <StatementTree statement={premise} index={index} />
                                    </Text>
                                </BoxButton>
                            ))}
                            <Divider />
                            {/* Added steps */}
                            {steps.length > 0 ? (
                                steps.map((step, index) => (
                                    <BoxButton {...getStepProps(index + props.data.length - 1)} onMouseOver={() => {
                                        setStore({ highlighted: step.source });
                                    }} onMouseOut={() => {
                                        setStore({ highlighted: [] });
                                    }}  boxProps={{
                                        display: "flex",
                                        alignItems: "baseline",
                                        width: "100%"
                                    }}>
                                        {`${index + props.data.length}. `}
                                        <Text flex="1" fontFamily="monospace" d="inline-block" ml="0.5rem" fontSize="1rem">
                                            <StatementTree statement={step.statement} index={index + props.data.length - 1}/>
                                        </Text>
                                        <Text color="gray.500">{step.source.map(s => s + 1).join(", ")} {step.argType}</Text>
                                        {steps.every(s => !s.source.includes(index + props.data.length - 1)) && (
                                            <CloseButton size="sm" ml="0.25rem" onClick={(e) => {
                                                e.stopPropagation();
                                                setStore({
                                                    selected: Array.isArray(selected) ? selected.filter(s => s !== index + props.data.length - 1) : selected.source === index + props.data.length - 1 ? [] : selected,
                                                    highlighted: [],
                                                    steps: removeEl(steps, index).map(v => ({
                                                        ...v,
                                                        // You shouldn't be able to click close if the index is contained in any of the source arrays, so no need for >=
                                                        source: v.source.map(s => s > (index + props.data.length - 1) ? s - 1 : s)
                                                    }))
                                                });
                                            }} />
                                        )}
                                    </BoxButton>
                                ))
                            ) : (
                                <Text color="gray.500">Get started by selecting premises to build from</Text>
                            )}
                        </Stack>
                        <Stack>
                            {Array.isArray(selected) ? (
                                <>
                                    <Heading as="h2" size="md">Argument forms</Heading>
                                    {selected.length > 0 ? (
                                        <>
                                            {argumentForms.length > 0 ? argumentForms.map(arg => arg.results.map(res => (
                                                <ArgFormButton res={res} arg={arg} />
                                            ))) : (
                                                <Text color="gray.500">No matching argument forms found</Text>
                                            )}
                                            {ReplacementRules}
                                        </>
                                    ) : (
                                        <Text color="gray.500">Nothing's selected yet</Text>
                                    )}
                                </>
                            ) : ReplacementRules}
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