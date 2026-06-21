import type { Prescription } from '@/types';

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

export const mockPrescriptions: Record<string, Prescription[]> = {
  m001: [
    {
      id: 'rx001',
      memberId: 'm001',
      doctorName: '李医生',
      issueDate: daysAgo(60),
      expireDate: daysLater(120),
      imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=300&fit=crop',
      notes: '高血压病史10年，血压控制尚可。建议每日晨起服用，定期监测血压。',
      status: 'valid',
      hospital: '北京协和医院',
    },
  ],
  m002: [
    {
      id: 'rx002',
      memberId: 'm002',
      doctorName: '王医生',
      issueDate: daysAgo(330),
      expireDate: daysLater(5),
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
      notes: '2型糖尿病，饮食控制配合药物治疗。注意监测血糖，3个月复查。',
      status: 'expiring',
      hospital: '北京大学第一医院',
    },
  ],
  m003: [
    {
      id: 'rx003',
      memberId: 'm003',
      doctorName: '张医生',
      issueDate: daysAgo(45),
      expireDate: daysLater(135),
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
      notes: '高血脂症，有冠心病家族史。建议低脂饮食，配合药物治疗。',
      status: 'valid',
      hospital: '中日友好医院',
    },
  ],
  m004: [
    {
      id: 'rx004',
      memberId: 'm004',
      doctorName: '陈医生',
      issueDate: daysAgo(400),
      expireDate: daysAgo(10),
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop',
      notes: '原发性高血压，2级。建议尽快复诊更新处方。',
      status: 'expired',
      hospital: '北京朝阳医院',
    },
  ],
  m005: [
    {
      id: 'rx005',
      memberId: 'm005',
      doctorName: '刘医生',
      issueDate: daysAgo(90),
      expireDate: daysLater(90),
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
      notes: '2型糖尿病，血糖控制良好。继续当前治疗方案，半年复诊。',
      status: 'valid',
      hospital: '北京同仁医院',
    },
  ],
  m006: [
    {
      id: 'rx006',
      memberId: 'm006',
      doctorName: '赵医生',
      issueDate: daysAgo(20),
      expireDate: daysLater(160),
      imageUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop',
      notes: '高胆固醇血症，建议配合饮食控制。3个月后复查血脂。',
      status: 'valid',
      hospital: '北京积水潭医院',
    },
  ],
  m007: [
    {
      id: 'rx007',
      memberId: 'm007',
      doctorName: '孙医生',
      issueDate: daysAgo(340),
      expireDate: daysLater(10),
      imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=300&fit=crop',
      notes: '高血压合并冠心病，需长期服药。建议尽快复诊。',
      status: 'expiring',
      hospital: '安贞医院',
    },
  ],
  m008: [
    {
      id: 'rx008',
      memberId: 'm008',
      doctorName: '周医生',
      issueDate: daysAgo(60),
      expireDate: daysLater(120),
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
      notes: '2型糖尿病，餐后血糖偏高。配合饮食控制，适量运动。',
      status: 'valid',
      hospital: '北京中医医院',
    },
  ],
  m009: [
    {
      id: 'rx009',
      memberId: 'm009',
      doctorName: '吴医生',
      issueDate: daysAgo(50),
      expireDate: daysLater(130),
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
      notes: '脑梗塞恢复期，需长期服用抗血小板药物。注意有无出血倾向。',
      status: 'valid',
      hospital: '天坛医院',
    },
  ],
  m010: [
    {
      id: 'rx010',
      memberId: 'm010',
      doctorName: '郑医生',
      issueDate: daysAgo(380),
      expireDate: daysAgo(5),
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop',
      notes: '混合型高脂血症。处方已过期，请尽快到医院复诊更新。',
      status: 'expired',
      hospital: '北京友谊医院',
    },
  ],
  m011: [
    {
      id: 'rx011',
      memberId: 'm011',
      doctorName: '钱医生',
      issueDate: daysAgo(15),
      expireDate: daysLater(165),
      imageUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop',
      notes: '高血压1级，低危。建议生活方式干预配合药物治疗。',
      status: 'valid',
      hospital: '宣武医院',
    },
  ],
  m012: [
    {
      id: 'rx012',
      memberId: 'm012',
      doctorName: '冯医生',
      issueDate: daysAgo(320),
      expireDate: daysLater(20),
      imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=300&fit=crop',
      notes: '2型糖尿病合并高血压。注意监测血糖血压，近期复诊调整方案。',
      status: 'expiring',
      hospital: '北京大学人民医院',
    },
  ],
};
