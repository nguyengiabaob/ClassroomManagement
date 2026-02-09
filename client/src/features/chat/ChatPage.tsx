import {
  DeleteOutlined,
  PaperClipOutlined,
  PhoneOutlined,
  SearchOutlined,
  SendOutlined,
  SmileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Input,
  List,
  message,
  Space,
  Tag,
  Typography,
} from "antd";
import React, { useState } from "react";

const { Text, Title } = Typography;
const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(1);
  const chats = [
    {
      id: 1,
      name: "Alex Johnson",
      lastMsg: "Teacher, can I ask about the homework...",
      time: "10:30",
      online: true,
    },
    {
      id: 2,
      name: "Sarah Miller",
      lastMsg: "I have submitted my assignment.",
      time: "09:15",
      online: false,
    },
    {
      id: 3,
      name: "Chris Evans",
      lastMsg: "Thank you so much!",
      time: "Yesterday",
      online: true,
    },
    {
      id: 4,
      name: "David Brown",
      lastMsg: "Where is the zoom link?",
      time: "Mon",
      online: false,
    },
  ];

  return (
    <div className="flex h-full bg-white rounded-none md:rounded-3xl shadow-sm overflow-hidden border border-slate-200">
      {/* Sidebar Chat List */}
      <div className="w-full md:w-80 border-r border-slate-100 flex flex-col h-full bg-white">
        <div className="p-4 border-b border-slate-100">
          <Title level={4} className="mb-4">
            Messages
          </Title>
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search conversations..."
            className="rounded-xl bg-slate-50 border-0"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <List
            dataSource={chats}
            renderItem={(item) => (
              <div
                onClick={() => setSelectedUser(item.id)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-blue-50 border-l-4 ${selectedUser === item.id ? "bg-blue-50 border-blue-600" : "border-transparent"}`}
              >
                <Badge
                  dot
                  status={item.online ? "success" : "default"}
                  offset={[-5, 32]}
                >
                  <Avatar
                    size={48}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`}
                    className="bg-slate-100"
                  />
                </Badge>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <Text strong className="truncate">
                      {item.name}
                    </Text>
                    <Text type="secondary" className="text-xs">
                      {item.time}
                    </Text>
                  </div>
                  <Text type="secondary" className="text-xs truncate block">
                    {item.lastMsg}
                  </Text>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Message Window */}
      <div className="hidden md:flex flex-1 flex-col h-full bg-slate-50">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
          <Space size="middle">
            <Avatar
              size={40}
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chats.find((c) => c.id === selectedUser)?.name}`}
            />
            <div>
              <Text strong className="block">
                {chats.find((c) => c.id === selectedUser)?.name}
              </Text>
              <Text type="secondary" className="text-xs">
                Active now
              </Text>
            </div>
          </Space>
          <Space>
            <Button type="text" icon={<PhoneOutlined />} />
            <Button type="text" icon={<UserOutlined />} />
            <Button type="text" icon={<DeleteOutlined />} />
          </Space>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="text-center">
            <Tag className="rounded-full bg-white border-slate-200 text-slate-400 px-4">
              Today
            </Tag>
          </div>

          {/* Message from other */}
          <div className="flex items-start gap-3">
            <Avatar
              size={32}
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chats.find((c) => c.id === selectedUser)?.name}`}
            />
            <div className="max-w-[70%]">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                <Text>
                  Hello teacher, I have a question about the React Hooks section
                  from yesterday's lecture.
                </Text>
              </div>
              <Text type="secondary" className="text-[10px] ml-1 mt-1 block">
                10:30 AM
              </Text>
            </div>
          </div>

          {/* Message from me */}
          <div className="flex items-start gap-3 flex-row-reverse">
            <Avatar
              size={32}
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            />
            <div className="max-w-[70%] text-right">
              <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-md text-white">
                <Text style={{ color: "white" }}>
                  Hi there! Which part is unclear? I can explain it right now.
                </Text>
              </div>
              <Text type="secondary" className="text-[10px] mr-1 mt-1 block">
                10:32 AM
              </Text>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Avatar
              size={32}
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chats.find((c) => c.id === selectedUser)?.name}`}
            />
            <div className="max-w-[70%]">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                <Text>
                  It's about the `useEffect` when used with a `dependency
                  array`. I don't quite understand when it re-runs.
                </Text>
              </div>
              <Text type="secondary" className="text-[10px] ml-1 mt-1 block">
                10:35 AM
              </Text>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <Button
              type="text"
              icon={<PaperClipOutlined className="text-slate-400" />}
            />
            <Input
              placeholder="Type your message..."
              variant="borderless"
              className="flex-1"
              onPressEnter={() => message.info("Message sent (Simulation)")}
            />
            <Space>
              <Button
                type="text"
                icon={<SmileOutlined className="text-slate-400 text-lg" />}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                className="bg-blue-600 flex items-center justify-center"
              />
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
