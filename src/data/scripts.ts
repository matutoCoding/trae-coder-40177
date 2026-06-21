import type { ScriptTemplate, MemberCategory, FollowUpMethod } from '@/types';

export const mockScripts: ScriptTemplate[] = [
  {
    type: 'phone',
    category: 'hypertension',
    title: '高血压用药提醒',
    content: '您好，我是XX大药房的药师小X。请问是[姓名]叔叔/阿姨吗？\n\n给您打电话是想提醒一下，您之前在我们药店购买的降压药（[药品名]）快用完了。根据您的用药情况，大概还剩[X]天的药量。\n\n您看什么时候方便再来店里配药呢？如果您来不了，也可以让家人带着您的处方来取。另外提醒您一下，您的处方[已过期/还有X天到期]，如果过期了需要先去医院更新处方哦。\n\n最近血压控制得怎么样？有什么用药方面的问题随时可以来店里找我们咨询。',
  },
  {
    type: 'phone',
    category: 'diabetes',
    title: '糖尿病用药提醒',
    content: '您好，我是XX大药房的药师小X。请问是[姓名]叔叔/阿姨吗？\n\n给您打电话是想提醒您，您的降糖药（[药品名]）快用完了，大概还剩[X]天的量。您看方便什么时候再来配药？\n\n顺便问一下，最近血糖控制得怎么样？有没有按时测血糖？饮食上也要多注意，少吃甜食和主食，多吃蔬菜。\n\n另外提醒您，您的处方[已过期/还有X天到期]，如果需要续药记得先去医院找医生更新一下处方。有任何用药问题随时来店里找我们。',
  },
  {
    type: 'phone',
    category: 'lipid',
    title: '降脂药用药提醒',
    content: '您好，我是XX大药房的药师小X。请问是[姓名]叔叔/阿姨吗？\n\n您之前在我们这里配的降脂药（[药品名]）快吃完了，大概还剩[X]天的量，打电话提醒您一下。\n\n最近有没有去复查血脂？饮食上也要注意少油少盐，适当运动。这个药需要长期规律服用，不要自己随便停药哦。\n\n您看什么时候方便再来配药？处方[已过期/还有X天到期]，如果过期了记得先去医院找医生看看。',
  },
  {
    type: 'phone',
    category: 'other',
    title: '通用用药提醒',
    content: '您好，我是XX大药房的药师小X。请问是[姓名]叔叔/阿姨吗？\n\n打电话是想提醒您，您之前在我们药店购买的[药品名]快用完了，大概还剩[X]天的药量。\n\n您看什么时候方便再来店里配药？用药过程中有什么不明白的地方随时可以来咨询我们的药师。\n\n另外您的处方[已过期/还有X天到期]，如果需要续药记得先去医院更新处方。',
  },
  {
    type: 'sms',
    category: 'hypertension',
    title: '高血压短信提醒',
    content: '【XX大药房】[姓名]您好，温馨提醒：您购买的降压药（[药品名]）即将用完，预计还剩[X]天药量。请及时凭处方到店续药。如需帮助请致电：[药店电话]。退订回T',
  },
  {
    type: 'sms',
    category: 'diabetes',
    title: '糖尿病短信提醒',
    content: '【XX大药房】[姓名]您好，您的降糖药（[药品名]）即将用完，预计还剩[X]天药量。请携带处方到店续药，定期监测血糖，注意饮食控制。咨询电话：[药店电话]。退订回T',
  },
  {
    type: 'sms',
    category: 'lipid',
    title: '降脂药短信提醒',
    content: '【XX大药房】[姓名]您好，您的降脂药（[药品名]）还剩[X]天用量，建议及时到店续药。请按时服药，定期复查血脂。咨询热线：[药店电话]。退订回T',
  },
  {
    type: 'sms',
    category: 'all',
    title: '处方到期提醒',
    content: '【XX大药房】[姓名]您好，提醒您的处方已过期/即将到期，如需续药请先到医院更新处方。XX大药房随时为您服务，电话：[药店电话]。退订回T',
  },
  {
    type: 'visit',
    category: 'all',
    title: '到店接待话术',
    content: '叔叔/阿姨您好，您来了呀！今天是来拿[药品名]对吧？让我帮您查一下库存...\n\n有的，您要拿几盒？您的处方给我看一下好吗？\n\n这个药要[饭前/饭后]服用，每天[X]次，一次[X]片，您都清楚吧？\n\n最近身体怎么样？血压/血糖控制得还好吗？有什么不舒服随时来店里跟我们说说。\n\n这是您的药，拿好。一共是[X]元，会员积分也帮您累计上了。下次药快吃完了我们会提前给您打电话的，您慢走！',
  },
];

export function getScriptsByTypeAndCategory(
  type: FollowUpMethod,
  category: MemberCategory
): ScriptTemplate[] {
  return mockScripts.filter(
    (s) => s.type === type && (s.category === category || s.category === 'all')
  );
}
