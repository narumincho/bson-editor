import React from "https://esm.sh/react@18.3.1?pin=v135";
import { WithLocation } from "../bson/location.ts";
import {
    bsonBinaryToStructuredBson,
    DocumentWithInvalid,
} from "../bson/main.ts";

export const Editor = (props: {
    value: Uint8Array;
}): React.ReactElement => {
    const [editorWidth, setEditorWidth] = React.useState(400);

    const structuredBson = React.useMemo(() =>
        bsonBinaryToStructuredBson(
            new Uint8Array(props.value),
        ), [props.value]);

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `${editorWidth}px 2px 1fr`,
            }}
        >
            <div>
                パースされたもの
            </div>
            <div
                style={{
                    backgroundColor: "#444",
                }}
            >
                <div
                    style={{
                        width: 12,
                        backgroundColor: "#888",
                    }}
                >
                </div>
            </div>
            <div>
                バイナリエディタ
            </div>
        </div>
    );
};
