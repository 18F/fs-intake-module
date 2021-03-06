const uuid = require('uuid/v4');

const data = [
  {
    id: uuid(),
    permit_cn: 'OF48303820',
    region_code: '01',
    region_name: 'Northern',
    forest_code: '10',
    forest_name: 'Flathead National Forest',
    district_code: '08',
    district_name: 'Tally Lake',
    plan_cn: 'OF011008',
    plan_no: 100011008,
    plan_description: 'OF Firewood Permits',
    issue_number: 'F0002',
    issue_date: '2020-11-18T08:00:00.000Z',
    perm_use_code: '2',
    percent_of_salvage_volume: 100,
    percent_of_cwk2_volume: 0,
    percent_of_cflr_volume: 0,
    percent_of_nftm_volume: 0,
    state_code: '30',
    state_name: 'Montana',
    number_of_permits: 1,
    convertible_non_convertible: 'C',
    spu_info:
      '{'
       + '"line_item_number": "1",'
       + '"species_code": "DOUGLASFIR",'
       + '"product_code": "07",'
       + '"uom_code": "02",'
       + '"sold_quantity": "1",'
       + '"rate": "5.00",'
       + '"yield_component_code": "CD",'
       + '"mbf_conv_factor": "2",'
       + '"ccf_con_factor": "2"'
      + '}'
  },
  {
    id: uuid(),
    permit_cn: 'OF23890327',
    region_code: '02',
    region_name: 'Rocky Mountain',
    forest_code: '14',
    forest_name: 'Shoshone National Forest',
    district_code: '04',
    district_name: 'Wapiti',
    plan_cn: 'OF021404',
    plan_no: 100021404,
    plan_description: 'OF Firewood Permits',
    issue_number: 'F0002',
    issue_date: '2020-11-22T08:00:00.000Z',
    perm_use_code: '2',
    percent_of_salvage_volume: 100,
    percent_of_cwk2_volume: 0,
    percent_of_cflr_volume: 0,
    percent_of_nftm_volume: 0,
    state_code: '56',
    state_name: 'Wyoming',
    number_of_permits: 1,
    convertible_non_convertible: 'C',
    spu_info:
      '{'
       + '"line_item_number": "1",'
       + '"species_code": "CEDAR",'
       + '"product_code": "07",'
       + '"uom_code": "02",'
       + '"sold_quantity": "1",'
       + '"rate": "5.00",'
       + '"yield_component_code": "CD",'
       + '"mbf_conv_factor": "2",'
       + '"ccf_con_factor": "2"'
      + '}'
  },
  {
    id: uuid(),
    permit_cn: 'OFd96d-4ef2-a5aa-1e0a782b27b8',
    region_code: '02',
    region_name: 'Rocky Mountain',
    forest_code: '14',
    forest_name: 'Shoshone National Forest',
    district_code: '04',
    district_name: 'Wapiti',
    plan_cn: 'OF021404',
    plan_no: 100021404,
    plan_description: 'OF Firewood Permits',
    issue_number: 'F0003',
    issue_date: '2020-12-23T08:00:00.000Z',
    perm_use_code: '2',
    percent_of_salvage_volume: 100,
    percent_of_cwk2_volume: 0,
    percent_of_cflr_volume: 0,
    percent_of_nftm_volume: 0,
    state_code: '56',
    state_name: 'Wyoming',
    number_of_permits: 1,
    convertible_non_convertible: 'C',
    spu_info:
      '{'
       + '"line_item_number": "1",'
       + '"species_code": "CSFW",'
       + '"product_code": "07",'
       + '"uom_code": "02",'
       + '"sold_quantity": "1",'
       + '"rate": "5.00",'
       + '"yield_component_code": "CD",'
       + '"mbf_conv_factor": "2",'
       + '"ccf_con_factor": "2"'
      + '}'
  },
  {
    id: uuid(),
    permit_cn: 'OF698d-4daa-aad2-8be299a3bffa',
    region_code: '01',
    region_name: 'Northern',
    forest_code: '10',
    forest_name: 'Flathead National Forest',
    district_code: '08',
    district_name: 'Tally Lake',
    plan_cn: 'OF011008',
    plan_no: 100011008,
    plan_description: 'OF Firewood Permits',
    issue_number: 'F0004',
    issue_date: '2020-12-23T08:00:00.000Z',
    perm_use_code: '2',
    percent_of_salvage_volume: 100,
    percent_of_cwk2_volume: 0,
    percent_of_cflr_volume: 0,
    percent_of_nftm_volume: 0,
    state_code: '30',
    state_name: 'Montana',
    number_of_permits: 1,
    convertible_non_convertible: 'C',
    spu_info:
      '{'
       + '"line_item_number": "1",'
       + '"species_code": "FW",'
       + '"product_code": "07",'
       + '"uom_code": "02",'
       + '"sold_quantity": "1",'
       + '"rate": "5.00",'
       + '"yield_component_code": "CD",'
       + '"mbf_conv_factor": "2",'
       + '"ccf_con_factor": "2"'
      + '}'
  }
];
module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('nrmEntries', data);
  },
  down(queryInterface) {
    return queryInterface.bulkDelete('nrmEntries');
  }
};
