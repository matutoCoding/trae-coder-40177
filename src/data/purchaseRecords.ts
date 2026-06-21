import type { PurchaseRecord } from '@/types';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

export const mockPurchaseRecords: Record<string, PurchaseRecord[]> = {
  m001: [
    { id: 'p001', memberId: 'm001', drugName: '苯磺酸氨氯地平片', boxes: 3, price: 89.7, purchaseDate: daysAgo(25), category: 'hypertension', pharmacist: '李药师' },
    { id: 'p002', memberId: 'm001', drugName: '苯磺酸氨氯地平片', boxes: 2, price: 59.8, purchaseDate: daysAgo(55), category: 'hypertension', pharmacist: '王药师' },
    { id: 'p003', memberId: 'm001', drugName: '苯磺酸氨氯地平片', boxes: 3, price: 89.7, purchaseDate: daysAgo(115), category: 'hypertension', pharmacist: '张药师' },
    { id: 'p004', memberId: 'm001', drugName: '阿司匹林肠溶片', boxes: 1, price: 25.0, purchaseDate: daysAgo(85), category: 'other', pharmacist: '李药师' },
  ],
  m002: [
    { id: 'p005', memberId: 'm002', drugName: '盐酸二甲双胍缓释片', boxes: 2, price: 68.0, purchaseDate: daysAgo(28), category: 'diabetes', pharmacist: '张药师' },
    { id: 'p006', memberId: 'm002', drugName: '盐酸二甲双胍缓释片', boxes: 3, price: 102.0, purchaseDate: daysAgo(88), category: 'diabetes', pharmacist: '李药师' },
    { id: 'p007', memberId: 'm002', drugName: '格列齐特片', boxes: 1, price: 45.0, purchaseDate: daysAgo(60), category: 'diabetes', pharmacist: '王药师' },
  ],
  m003: [
    { id: 'p008', memberId: 'm003', drugName: '阿托伐他汀钙片', boxes: 2, price: 156.0, purchaseDate: daysAgo(20), category: 'lipid', pharmacist: '王药师' },
    { id: 'p009', memberId: 'm003', drugName: '阿托伐他汀钙片', boxes: 2, price: 156.0, purchaseDate: daysAgo(80), category: 'lipid', pharmacist: '张药师' },
    { id: 'p010', memberId: 'm003', drugName: '苯磺酸氨氯地平片', boxes: 2, price: 59.8, purchaseDate: daysAgo(50), category: 'hypertension', pharmacist: '李药师' },
  ],
  m004: [
    { id: 'p011', memberId: 'm004', drugName: '缬沙坦胶囊', boxes: 1, price: 42.0, purchaseDate: daysAgo(30), category: 'hypertension', pharmacist: '李药师' },
    { id: 'p012', memberId: 'm004', drugName: '缬沙坦胶囊', boxes: 2, price: 84.0, purchaseDate: daysAgo(90), category: 'hypertension', pharmacist: '王药师' },
  ],
  m005: [
    { id: 'p013', memberId: 'm005', drugName: '格列美脲片', boxes: 3, price: 120.0, purchaseDate: daysAgo(22), category: 'diabetes', pharmacist: '张药师' },
    { id: 'p014', memberId: 'm005', drugName: '格列美脲片', boxes: 2, price: 80.0, purchaseDate: daysAgo(82), category: 'diabetes', pharmacist: '李药师' },
  ],
  m006: [
    { id: 'p015', memberId: 'm006', drugName: '瑞舒伐他汀钙片', boxes: 1, price: 98.0, purchaseDate: daysAgo(15), category: 'lipid', pharmacist: '王药师' },
    { id: 'p016', memberId: 'm006', drugName: '瑞舒伐他汀钙片', boxes: 1, price: 98.0, purchaseDate: daysAgo(45), category: 'lipid', pharmacist: '张药师' },
  ],
  m007: [
    { id: 'p017', memberId: 'm007', drugName: '硝苯地平缓释片', boxes: 2, price: 56.0, purchaseDate: daysAgo(27), category: 'hypertension', pharmacist: '李药师' },
    { id: 'p018', memberId: 'm007', drugName: '硝苯地平缓释片', boxes: 3, price: 84.0, purchaseDate: daysAgo(87), category: 'hypertension', pharmacist: '王药师' },
  ],
  m008: [
    { id: 'p019', memberId: 'm008', drugName: '阿卡波糖片', boxes: 2, price: 96.0, purchaseDate: daysAgo(18), category: 'diabetes', pharmacist: '张药师' },
    { id: 'p020', memberId: 'm008', drugName: '阿卡波糖片', boxes: 2, price: 96.0, purchaseDate: daysAgo(78), category: 'diabetes', pharmacist: '李药师' },
  ],
  m009: [
    { id: 'p021', memberId: 'm009', drugName: '阿司匹林肠溶片', boxes: 2, price: 50.0, purchaseDate: daysAgo(23), category: 'other', pharmacist: '王药师' },
    { id: 'p022', memberId: 'm009', drugName: '阿司匹林肠溶片', boxes: 3, price: 75.0, purchaseDate: daysAgo(83), category: 'other', pharmacist: '张药师' },
  ],
  m010: [
    { id: 'p023', memberId: 'm010', drugName: '普伐他汀钠片', boxes: 1, price: 65.0, purchaseDate: daysAgo(29), category: 'lipid', pharmacist: '李药师' },
    { id: 'p024', memberId: 'm010', drugName: '普伐他汀钠片', boxes: 2, price: 130.0, purchaseDate: daysAgo(89), category: 'lipid', pharmacist: '王药师' },
  ],
  m011: [
    { id: 'p025', memberId: 'm011', drugName: '贝那普利片', boxes: 3, price: 108.0, purchaseDate: daysAgo(10), category: 'hypertension', pharmacist: '张药师' },
    { id: 'p026', memberId: 'm011', drugName: '贝那普利片', boxes: 2, price: 72.0, purchaseDate: daysAgo(100), category: 'hypertension', pharmacist: '李药师' },
  ],
  m012: [
    { id: 'p027', memberId: 'm012', drugName: '吡格列酮片', boxes: 2, price: 110.0, purchaseDate: daysAgo(26), category: 'diabetes', pharmacist: '王药师' },
    { id: 'p028', memberId: 'm012', drugName: '吡格列酮片', boxes: 3, price: 165.0, purchaseDate: daysAgo(86), category: 'diabetes', pharmacist: '张药师' },
  ],
};
