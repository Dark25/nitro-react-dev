import { HabboClubLevelEnum, RoomControllerLevel } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChatMessageTypeEnum, GetClubMemberLevel, GetConfiguration, GetSessionDataManager, LocalizeText, RoomWidgetUpdateChatInputContentEvent } from '../../../../api';
import { Text } from '../../../../common';
import { useChatInputWidget, useRoom, useSessionInfo, useUiEvent } from '../../../../hooks';
import { ChatEmojiSelectorView } from './ChatInputEmojisSelectorView';
import { ChatInputStickersSelectorView } from './ChatInputStickersSelectorView';
import { ChatInputStyleSelectorView } from './ChatInputStyleSelectorView';

export const ChatInputView: FC<{}> = props =>
{
    const [ chatValue, setChatValue ] = useState<string>('');
    const { chatStyleId = 0, updateChatStyleId = null } = useSessionInfo();
    const { selectedUsername = '', floodBlocked = false, floodBlockedSeconds = 0, setIsTyping = null, setIsIdle = null, sendChat = null } = useChatInputWidget();
    const { roomSession = null } = useRoom();
    const inputRef = useRef<HTMLInputElement>();

    const chatModeIdWhisper = useMemo(() => LocalizeText('widgets.chatinput.mode.whisper'), []);
    const chatModeIdShout = useMemo(() => LocalizeText('widgets.chatinput.mode.shout'), []);
    const chatModeIdSpeak = useMemo(() => LocalizeText('widgets.chatinput.mode.speak'), []);
    const maxChatLength = useMemo(() => GetConfiguration<number>('chat.input.maxlength', 100), []);

    var mediaRecorder;
    var audioChunks = [];

    var deletedAudio = false;
    
    function startRecording()
    {
        var microphoneOn = document.getElementById('microphoneOn');
        var microphoneOff = document.getElementById('microphoneOff');
        var deleteAudio = document.getElementById('deleteAudio');
        
        microphoneOn.style.display = 'none';
        microphoneOff.style.display = 'inline-block';
        deleteAudio.style.display = 'inline-block';
        
        navigator.mediaDevices.getUserMedia({ audio:true })
            .then(stream=> 
            {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                mediaRecorder.addEventListener('dataavailable', event => 
                {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener('stop', () => 
                {
                    microphoneOn.style.display = 'inline-block';
                    microphoneOff.style.display = 'none';
                    deleteAudio.style.display = 'none';

                    if(!deletedAudio)
                    {
                        const audioBlob = new Blob(audioChunks);
                        if(audioBlob.size < 378461)
                        {
                            var fd = new FormData();
                            fd.append('audio', audioBlob);

                            
                            fetch(GetConfiguration<string>('audio.url'), { method:'POST', body: fd })
                                .then((response) => response.text())
                                .then((resp) => 
                                {
                                    sendChatValue(selectedUsername +GetConfiguration<string>('audio.sounds.url') + resp + '.mp3', false);
                                
                                })
                        }
                        else 
                        {
                            alert('El audio es demasiado largo, el máximo permitido es de 30 segundos.');
                        }
                    }
                    
                    deletedAudio = false;
                    audioChunks = [];
                });
            })
    }

    function stopRecording()
    {
        mediaRecorder.stop();
    }

    function deleteRecording()
    {
        deletedAudio = true;
        mediaRecorder.stop();
    }

    function showSubMenu()
    {
        if(document.getElementById('submenuChat').style.display == 'flex') document.getElementById('submenuChat').style.display = 'none';
        else document.getElementById('submenuChat').style.display = 'flex'; 
    }

    function hideSubMenu()
    {
        document.getElementById('submenuChat').style.display = 'none';
    }



    const anotherInputHasFocus = useCallback(() =>
    {
        const activeElement = document.activeElement;

        if(!activeElement) return false;

        if(inputRef && (inputRef.current === activeElement)) return false;

        if(!(activeElement instanceof HTMLInputElement) && !(activeElement instanceof HTMLTextAreaElement)) return false;

        return true;
    }, [ inputRef ]);

    const setInputFocus = useCallback(() =>
    {
        inputRef.current.focus();

        inputRef.current.setSelectionRange((inputRef.current.value.length * 2), (inputRef.current.value.length * 2));
    }, [ inputRef ]);

    const checkSpecialKeywordForInput = useCallback(() =>
    {
        setChatValue(prevValue =>
        {
            if((prevValue !== chatModeIdWhisper) || !selectedUsername.length) return prevValue;

            return (`${ prevValue } ${ selectedUsername }`);
        });
    }, [ selectedUsername, chatModeIdWhisper ]);

    const sendChatValue = useCallback((value: string, shiftKey: boolean = false) =>
    {
        if(!value || (value === '')) return;

        let chatType = (shiftKey ? ChatMessageTypeEnum.CHAT_SHOUT : ChatMessageTypeEnum.CHAT_DEFAULT);
        let text = value;

        const parts = text.split(' ');

        let recipientName = '';
        let append = '';

        switch(parts[0])
        {
            case chatModeIdWhisper:
                chatType = ChatMessageTypeEnum.CHAT_WHISPER;
                recipientName = parts[1];
                append = (chatModeIdWhisper + ' ' + recipientName + ' ');

                parts.shift();
                parts.shift();
                break;
            case chatModeIdShout:
                chatType = ChatMessageTypeEnum.CHAT_SHOUT;

                parts.shift();
                break;
            case chatModeIdSpeak:
                chatType = ChatMessageTypeEnum.CHAT_DEFAULT;

                parts.shift();
                break;
        }

        text = parts.join(' ');

        setIsTyping(false);
        setIsIdle(false);

        if(text.length <= maxChatLength)
        {
            if(/%CC%/g.test(encodeURIComponent(text)))
            {
                setChatValue('');
            }
            else
            {
                setChatValue('');
                sendChat(text, chatType, recipientName, chatStyleId);
            }
        }

        setChatValue(append);
    }, [ chatModeIdWhisper, chatModeIdShout, chatModeIdSpeak, maxChatLength, chatStyleId, setIsTyping, setIsIdle, sendChat ]);

    const updateChatInput = useCallback((value: string) =>
    {
        if(!value || !value.length)
        {
            setIsTyping(false);
        }
        else
        {
            setIsTyping(true);
            setIsIdle(true);
        }

        setChatValue(value);
    }, [ setIsTyping, setIsIdle ]);

    const onKeyDownEvent = useCallback((event: KeyboardEvent) =>
    {
        if(floodBlocked || !inputRef.current || anotherInputHasFocus()) return;

        if(document.activeElement !== inputRef.current) setInputFocus();

        const value = (event.target as HTMLInputElement).value;

        switch(event.key)
        {
            case ' ':
            case 'Space':
                checkSpecialKeywordForInput();
                return;
            case 'NumpadEnter':
            case 'Enter':
                sendChatValue(value, event.shiftKey);
                return;
            case 'Backspace':
                if(value)
                {
                    const parts = value.split(' ');

                    if((parts[0] === chatModeIdWhisper) && (parts.length === 3) && (parts[2] === ''))
                    {
                        setChatValue('');
                    }
                }
                return;
        }

    }, [ floodBlocked, inputRef, chatModeIdWhisper, anotherInputHasFocus, setInputFocus, checkSpecialKeywordForInput, sendChatValue ]);

    useUiEvent<RoomWidgetUpdateChatInputContentEvent>(RoomWidgetUpdateChatInputContentEvent.CHAT_INPUT_CONTENT, event =>
    {
        switch(event.chatMode)
        {
            case RoomWidgetUpdateChatInputContentEvent.WHISPER: {
                setChatValue(`${ chatModeIdWhisper } ${ event.userName } `);
                return;
            }
            case RoomWidgetUpdateChatInputContentEvent.SHOUT:
                return;
        }
    });

    const chatStyleIds = useMemo(() =>
    {
        let styleIds: number[] = [];

        const styles = GetConfiguration<{ styleId: number, minRank: number, isSystemStyle: boolean, isHcOnly: boolean, isAmbassadorOnly: boolean }[]>('chat.styles');

        for(const style of styles)
        {
            if(!style) continue;

            if(style.minRank > 0)
            {
                if(GetSessionDataManager().hasSecurity(style.minRank)) styleIds.push(style.styleId);

                continue;
            }

            if(style.isSystemStyle)
            {
                if(GetSessionDataManager().hasSecurity(RoomControllerLevel.MODERATOR))
                {
                    styleIds.push(style.styleId);

                    continue;
                }
            }

            if(GetConfiguration<number[]>('chat.styles.disabled').indexOf(style.styleId) >= 0) continue;

            if(style.isHcOnly && (GetClubMemberLevel() >= HabboClubLevelEnum.CLUB))
            {
                styleIds.push(style.styleId);

                continue;
            }

            if(style.isAmbassadorOnly && GetSessionDataManager().isAmbassador)
            {
                styleIds.push(style.styleId);

                continue;
            }

            if(!style.isHcOnly && !style.isAmbassadorOnly) styleIds.push(style.styleId);
        }

        return styleIds;
    }, []);

    useEffect(() =>
    {
        document.body.addEventListener('keydown', onKeyDownEvent);

        return () =>
        {
            document.body.removeEventListener('keydown', onKeyDownEvent);
        }
    }, [ onKeyDownEvent ]);

    useEffect(() =>
    {
        if(!inputRef.current) return;

        inputRef.current.parentElement.dataset.value = chatValue;
    }, [ chatValue ]);

    const selectChatEmoji = useCallback((emojiId: string) =>
    {
        setChatValue(prevValue => prevValue + emojiId);
    }, [ setChatValue ]);

    const selectChatStickers = useCallback((stickerId: string) =>
    {
        //AGREGA EL TIPO DE MENSAJE
        sendChatValue(selectedUsername + ' ' + stickerId, false);
    }, [ sendChatValue, selectedUsername ]);

    if(!roomSession || roomSession.isSpectator) return null;

   
    return (
        createPortal(
            <>
                <div id="submenuChat" className="animate__animated animate__fadeInUp animate__faster" style={ { position: 'absolute', backgroundColor: 'rgba(43, 43, 43, 0.8)', top: '-20px', borderRadius: '7px', display: 'none', justifyContent: 'space-around', alignItems: 'center', border: '1px #fff solid', width: '210px', boxSizing: 'border-box' } }> 
                    <ChatInputStyleSelectorView chatStyleId={ chatStyleId } chatStyleIds={ chatStyleIds } selectChatStyleId={ updateChatStyleId } />
                    <ChatEmojiSelectorView selectChatEmoji={ selectChatEmoji } />
                    <ChatInputStickersSelectorView selectChatStickers={ selectChatStickers } />
                    <div id="microphoneOn" onClick={ e => startRecording() } style={ { display: 'inline-block' } } className="icon chatmicrophone-on-icon" />
                    <div id="microphoneOff" onClick={ e => stopRecording() } style={ { display: 'none' } } className="icon chatmicrophone-off-icon" />
                    <div id="deleteAudio" onClick={ e => deleteRecording() } style={ { display: 'none' } } className="icon chatdeleteaudio-icon" />
                    <div onClick={ () => hideSubMenu() } className="icon chatequis-icon" style={ { marginLeft: '10px', display: 'inline-block' } } />
                </div>
                <div className="nitro-chat-input-container" style={ { height: '49px' } }> 
                    <div className="chat-size input-sizer align-items-center" style={ { justifyContent: 'start' } }>
                        <div onClick={ () => showSubMenu() } className="icon chatmas-icon" style={ { marginRight: '3px' } } />
                        { !floodBlocked &&
                    <input style={ { marginLeft: '5px' } } ref={ inputRef } type="text" className="chat-input" placeholder={ LocalizeText('widgets.chatinput.default') } value={ chatValue } maxLength={ maxChatLength } onChange={ event => updateChatInput(event.target.value) } onMouseDown={ event => setInputFocus() } /> }
                        { floodBlocked &&
                    <Text variant="danger">{ LocalizeText('chat.input.alert.flood', [ 'time' ], [ floodBlockedSeconds.toString() ]) } </Text> }
                    </div>
                </div>
            </>, document.getElementById('toolbar-chat-input-container'))
    );
}
