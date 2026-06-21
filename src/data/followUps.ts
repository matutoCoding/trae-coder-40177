import type { FollowUpRecord } from '@/types';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return formatDate(d);
};
const daysLater = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

export const mockFollowUps: Record<string, FollowUpRecord[]> = {
  m001: [
    { id: 'f001', memberId: 'm001', followDate: daysAgo(7), method: 'phone', result: 'connected', notes: '会员表示血压控制良好，下周会来店购药。', operator: '李营业员', nextFollowDate: formatDate(today) },
    { id: 'f002', memberId: 'm001', followDate: daysAgo(37), method: 'sms', result: 'connected', notes: '短信提醒后回电确认，已安排购药。', operator: '王营业员', nextFollowDate: daysAgo(7) },
    { id: 'f003', memberId: 'm001', followDate: daysAgo(97), method: 'phone', result: 'purchased', notes: '已到店购买3盒，告知用药注意事项。', operator: '张营业员', nextFollowDate: daysAgo(37) },
  ],
  m002: [
    { id: 'f004', memberId: 'm002', followDate: daysAgo(1), method: 'phone', result: 'no_answer', notes: '电话无人接听，稍后再拨。', operator: '李营业员', nextFollowDate: formatDate(today) },
    { id: 'f005', memberId: 'm002', followDate: daysAgo(2), method: 'sms', result: 'no_answer', notes: '发送提醒短信，未回复。', operator: '李营业员', nextFollowDate: daysAgo(1) },
    { id: 'f006', memberId: 'm002', followDate: daysAgo(60), method: 'phone', result: 'purchased', notes: '已到店购买，处方即将到期提醒更新。', operator: '张营业员', nextFollowDate: daysAgo(30) },
  ],
  m003: [
    { id: 'f007', memberId: 'm003', followDate: daysAgo(20), method: 'visit', result: 'purchased', notes: '到店咨询后购买2盒，赠送小礼品。', operator: '王营业员', nextFollowDate: formatDate(today) },
    { id: 'f008', memberId: 'm003', followDate: daysAgo(80), method: 'phone', result: 'connected', notes: '确认用药情况，提醒定期复查血脂。', operator: '李营业员', nextFollowDate: daysAgo(50) },
  ],
  m004: [
    { id: 'f009', memberId: 'm004', followDate: daysAgo(14), method: 'phone', result: 'not_needed', notes: '会员表示目前药还够用，暂时不需要购买。', operator: '张营业员', nextFollowDate: formatDate(today) },
    { id: 'f010', memberId: 'm004', followDate: daysAgo(44), method: 'sms', result: 'no_answer', notes: '发送短信未回复。', operator: '王营业员', nextFollowDate: daysAgo(30) },
  ],
  m005: [
    { id: 'f011', memberId: 'm005', followDate: daysAgo(8), method: 'phone', result: 'connected', notes: '会员说血糖控制不错，过两天来买。', operator: '王营业员', nextFollowDate: formatDate(today) },
    { id: 'f012', memberId: 'm005', followDate: daysAgo(68), method: 'phone', result: 'purchased', notes: '已购买3盒格列美脲。', operator: '李营业员', nextFollowDate: daysAgo(38) },
  ],
  m006: [
    { id: 'f013', memberId: 'm006', followDate: daysAgo(15), method: 'phone', result: 'purchased', notes: '昨日到店购买1盒，处方还有半年有效期。', operator: '张营业员', nextFollowDate: daysLater(8) },
  ],
  m007: [
    { id: 'f014', memberId: 'm007', followDate: daysAgo(2), method: 'phone', result: 'no_answer', notes: '连续两天未接通，换时间再拨打。', operator: '李营业员', nextFollowDate: formatDate(today) },
    { id: 'f015', memberId: 'm007', followDate: daysAgo(3), method: 'sms', result: 'no_answer', notes: '发送提醒短信。', operator: '李营业员', nextFollowDate: daysAgo(2) },
  ],
  m008: [
    { id: 'f016', memberId: 'm008', followDate: daysAgo(12), method: 'phone', result: 'connected', notes: '会员表示还剩一周药量，下周来买。', operator: '王营业员', nextFollowDate: daysLater(6) },
    { id: 'f017', memberId: 'm008', followDate: daysAgo(72), method: 'phone', result: 'purchased', notes: '已到店购买2盒阿卡波糖。', operator: '张营业员', nextFollowDate: daysAgo(42) },
  ],
  m009: [
    { id: 'f018', memberId: 'm009', followDate: daysAgo(7), method: 'phone', result: 'connected', notes: '确认用药情况，提醒不要随意停药。', operator: '张营业员', nextFollowDate: formatDate(today) },
    { id: 'f019', memberId: 'm009', followDate: daysAgo(67), method: 'phone', result: 'purchased', notes: '购买2盒阿司匹林。', operator: '李营业员', nextFollowDate: daysAgo(37) },
  ],
  m010: [
    { id: 'f020', memberId: 'm010', followDate: daysAgo(3), method: 'phone', result: 'no_answer', notes: '电话无人接听。', operator: '王营业员', nextFollowDate: formatDate(today) },
    { id: 'f021', memberId: 'm010', followDate: daysAgo(33), method: 'sms', result: 'no_answer', notes: '处方过期提醒，未回复。', operator: '李营业员', nextFollowDate: daysAgo(20) },
  ],
  m011: [
    { id: 'f022', memberId: 'm011', followDate: daysAgo(10), method: 'visit', result: 'purchased', notes: '上午到店购买3盒，与药师咨询了用药问题。', operator: '张营业员', nextFollowDate: daysLater(13) },
  ],
  m012: [
    { id: 'f023', memberId: 'm012', followDate: daysAgo(10), method: 'phone', result: 'connected', notes: '提醒处方即将到期，建议尽快去医院复诊。', operator: '王营业员', nextFollowDate: formatDate(today) },
    { id: 'f024', memberId: 'm012', followDate: daysAgo(70), method: 'phone', result: 'purchased', notes: '已购买2盒吡格列酮。', operator: '李营业员', nextFollowDate: daysAgo(40) },
  ],
};
