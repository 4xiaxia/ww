import React from 'react';
import { AgentState } from '../types';

interface VoiceButtonProps {
  isRecording: boolean;
  agentState: AgentState;
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
}

/**
 * 长按录音按钮
 * 交互规则：
 * - onPointerDown → 开始录音（无提示）
 * - onPointerUp → 停止录音并发送（无确认）
 * - 最短1秒，最长60秒
 * - 无"上滑取消"等复杂交互
 */
const VoiceButton: React.FC<VoiceButtonProps> = ({
  isRecording,
  agentState,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
}) => {
  const isProcessing = agentState === AgentState.THINKING || agentState === AgentState.SPEAKING;
  const isDisabled = isProcessing;

  return (
    <button
      onPointerDown={!isDisabled ? onPointerDown : undefined}
      onPointerUp={!isDisabled ? onPointerUp : undefined}
      onPointerLeave={!isDisabled ? onPointerLeave : undefined}
      disabled={isDisabled}
      className={`h-14 px-8 rounded-full font-bold flex items-center gap-3 transition-all shadow-lg select-none touch-none ${
        isRecording
          ? 'bg-red-500 text-white scale-110 animate-pulse'
          : isProcessing
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-red-100 to-white text-red-600 border-2 border-red-200 hover:scale-105 active:scale-95'
      }`}
    >
      {isRecording ? (
        <>
          <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
          <span className="text-lg">🔴 录音中</span>
        </>
      ) : isProcessing ? (
        <>
          <i className="fas fa-circle-notch fa-spin"></i>
          <span className="text-lg">⏳ 处理中</span>
        </>
      ) : (
        <>
          <i className="fas fa-microphone-alt text-xl"></i>
          <span className="text-lg">🎤 按住说话</span>
        </>
      )}
    </button>
  );
};

export default VoiceButton;
