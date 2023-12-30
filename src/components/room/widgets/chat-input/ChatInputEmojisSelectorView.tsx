import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { FC, MouseEvent, useEffect, useState } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { Base } from '../../../../common';


interface ChatEmojiSelectorViewProps
{
    selectChatEmoji: (emojiId: string) => void;
}

export const ChatEmojiSelectorView: FC<ChatEmojiSelectorViewProps> = props =>
{
    const { selectChatEmoji = null } = props;
    const [ target, setTarget ] = useState<(EventTarget & HTMLElement)>(null);
    const [ selectorVisible, setSelectorVisible ] = useState(false);

    const selectEmoji = (emojiId: string) =>
    {
        selectChatEmoji(emojiId);
    }

    const toggleSelector = (event: MouseEvent<HTMLElement>) =>
    {
        let visible = false;

        setSelectorVisible(prevValue =>
        {
            visible = !prevValue;

            return visible;
        });

        if(visible) setTarget((event.target as (EventTarget & HTMLElement)));
    }

    useEffect(() =>
    {
        if(selectorVisible) return;

        setTarget(null);
    }, [ selectorVisible ]);

    return (
        <>
            <Base pointer className="icon chatemojis-icon" onClick={ toggleSelector }></Base>
            <Overlay show={ selectorVisible } target={ target } placement="top">
                <Popover style={ { width: 'auto' } }>
                    <Picker data={ data } onEmojiSelect={ (emoji: { native: string; }) => selectEmoji(emoji.native) } locale="es" perLine={ 7 } />
                </Popover>
            </Overlay>
        </>
    );
}
