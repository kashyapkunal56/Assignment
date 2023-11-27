public class HolidayCalendar {
    
    @auraEnabled
    public static List<Object> fetchAPI(String year, String dob, String gender, String citizen, String SAId) {
        String apiKey = Label.Holiday_Calendar_API_Key;
        String country = Label.Country_South_Africa;
        Integer numberOfTimeSearch = 1;
        
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://calendarific.com/api/v2/holidays?&api_key='+apiKey+'&country='+country+'&year='+year);
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            JSONParser parser = JSON.createParser(response.getBody());
            Map<String, Object> result = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
            Map<String,object> getResult = (Map<String,object>) result.get('response');
            List<Object> holidaysObject = (List<Object>) getResult.get('holidays');
            List<Holiday_Search_Log__c> searchLogList = [Select id,Number_of_Times_Search__c from Holiday_Search_Log__c where SA_Id__c =:SAId];
            Holiday_Search_Log__c serachLog = new Holiday_Search_Log__c();
            serachLog.Citizen__c = (citizen =='Yes')?'SA citizen':'Permanent resident';
            serachLog.Date_of_Birth__c = date.valueOf(dob);
            serachLog.Gender__c = gender;
            serachLog.SA_Id__c = SAId;
            serachLog.Number_of_Times_Search__c = (searchLogList.isEmpty())? numberOfTimeSearch:searchLogList[0].Number_of_Times_Search__c+1;
            upsert serachLog SA_Id__c;
            
            return holidaysObject;
        }
        return null;
        
    }
    
}